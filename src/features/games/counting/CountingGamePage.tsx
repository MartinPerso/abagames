import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  countingGameNameByLanguage,
  countingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import { playRewardSfx, REWARD_SFX_DURATION_MS } from '../../../shared/audio/sfx'
import {
  type CountingItem,
  TOTAL_ROUNDS,
  createRound,
  getAnswerOptions,
  isCorrectAnswer,
} from './gameLogic'
import { getStoredCountingMaxObjects } from '../../../shared/settings/gameSettings'
import './CountingGamePage.css'

type FeedbackState = 'idle' | 'correct' | 'wrong'
const assetsBaseUrl = `${import.meta.env.BASE_URL}assets/illustrations`

const sceneClassByItem: Record<CountingItem, string> = {
  fireTruck: 'item-scene item-fire',
  policeCar: 'item-scene item-police',
  ambulance: 'item-scene item-ambulance',
  boat: 'item-scene item-boat',
  plane: 'item-scene item-plane',
}

const imageByItem: Record<CountingItem, string> = {
  fireTruck: `${assetsBaseUrl}/fireTruck.svg`,
  policeCar: `${assetsBaseUrl}/policeCar.svg`,
  ambulance: `${assetsBaseUrl}/ambulance.svg`,
  boat: `${assetsBaseUrl}/boat.svg`,
  plane: `${assetsBaseUrl}/plane.svg`,
}

type ItemPosition = {
  left: number
  top: number
  size: number
}

function createItemPositions(count: number): ItemPosition[] {
  const baseSize = Math.max(14, Math.min(30, 78 / Math.sqrt(count)))
  const minSize = 10
  const sizeReductionFactor = 0.92
  const placementGap = 0.8
  const maxAttemptsPerItem = 400
  const maxConsecutiveOverlaps = 5

  let currentSize = baseSize
  let consecutiveOverlaps = 0
  const positions: ItemPosition[] = []

  function overlapsAny(next: ItemPosition): boolean {
    return positions.some((position) => {
      const minDistance = (position.size + next.size) / 2 + placementGap
      const dx = position.left - next.left
      const dy = position.top - next.top
      return dx * dx + dy * dy < minDistance * minDistance
    })
  }

  for (let index = 0; index < count; index += 1) {
    let placed = false
    let attempts = 0

    while (!placed && attempts < maxAttemptsPerItem) {
      attempts += 1
      const halfSize = currentSize / 2
      const left = halfSize + Math.random() * (100 - currentSize)
      const top = halfSize + Math.random() * (100 - currentSize)
      const candidate: ItemPosition = { left, top, size: currentSize }

      if (!overlapsAny(candidate)) {
        positions.push(candidate)
        consecutiveOverlaps = 0
        placed = true
        continue
      }

      // On rejette ce dispatch et on retente ailleurs.
      consecutiveOverlaps += 1
      if (consecutiveOverlaps >= maxConsecutiveOverlaps) {
        currentSize = Math.max(minSize, currentSize * sizeReductionFactor)
        consecutiveOverlaps = 0
      }
    }

    if (!placed) {
      currentSize = Math.max(minSize, currentSize * sizeReductionFactor)
      index -= 1
    }
  }

  return positions
}

export function CountingGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const maxObjects = getStoredCountingMaxObjects()
  const answerOptions = getAnswerOptions(maxObjects)
  const text = countingGameTextByLanguage[language]
  const itemLabels = itemLabelByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0, maxObjects))
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const timerRef = useRef<number | null>(null)

  function clearActiveTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearActiveTimer()
    }
  }, [])

  function moveToNextRound() {
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      setRoundIndex(TOTAL_ROUNDS)
      setIsLocked(false)
      return
    }

    const nextIndex = roundIndex + 1
    setRoundIndex(nextIndex)
    setRound(createRound(nextIndex, maxObjects))
    setFeedback('idle')
    setIsLocked(false)
  }

  function handleAnswer(answer: number) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, answer)) {
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      clearActiveTimer()
      playRewardSfx(round.item)

      timerRef.current = window.setTimeout(() => {
        moveToNextRound()
      }, REWARD_SFX_DURATION_MS)
      return
    }

    setFeedback('wrong')
    clearActiveTimer()
    timerRef.current = window.setTimeout(() => {
      setFeedback('idle')
    }, 700)
  }

  function restartGame() {
    clearActiveTimer()

    setRoundIndex(0)
    setRound(createRound(0, maxObjects))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
  }

  const finished = roundIndex >= TOTAL_ROUNDS
  const itemPositions = useMemo(
    () => createItemPositions(round.count),
    [round.roundIndex, round.item, round.count],
  )

  return (
    <main className="app-shell counting-page">
      <header className="counting-header">
        <h1>{countingGameNameByLanguage[language]}</h1>
        <div className="header-actions">
          <Link to={`/?lang=${language}`} className="secondary-link">
            ⌂
          </Link>
        </div>
      </header>

      {finished ? (
        <section className="result-card" aria-live="polite">
          <h2>🎉</h2>
          <p>
            {score}/{TOTAL_ROUNDS}
          </p>
          <div className="result-actions">
            <button type="button" className="answer-button" onClick={restartGame}>
              ↺
            </button>
            <Link to={`/?lang=${language}`} className="secondary-link">
              ⌂
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="question-content">
            <section className="counting-stage" aria-label={itemLabels[round.item]}>
              <div className={sceneClassByItem[round.item]}>
                {itemPositions.map((position, index) => (
                  <div
                    key={`${round.roundIndex}-${round.item}-${index}`}
                    className={`item-sprite ${feedback === 'correct' ? 'is-celebrating' : ''}`}
                    style={{
                      left: `${position.left}%`,
                      top: `${position.top}%`,
                      width: `${position.size}%`,
                      height: `${position.size}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    aria-hidden="true"
                  >
                    <img src={imageByItem[round.item]} alt="" className="item-image" />
                  </div>
                ))}
              </div>
            </section>

            <p className={`feedback ${feedback}`} />
          </div>

          <section
            className={`answers ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`}
            aria-label={text.answerLabel}
          >
            <div className="answer-grid">
              {answerOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`answer-button ${feedback === 'correct' && value === round.count ? 'is-correct-answer' : ''}`}
                  onClick={() => handleAnswer(value)}
                  disabled={isLocked}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>
          {feedback === 'correct' ? (
            <div className="success-overlay" role="alert" aria-live="assertive">
              <div className="success-alert">
                <span>{text.bravoAlert}</span>
                <span className="emoji-burst" aria-hidden="true">
                  🎉 ✨ 🎉
                </span>
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}

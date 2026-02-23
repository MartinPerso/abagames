import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  inverseCountingGameNameByLanguage,
  inverseCountingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import { playRewardSfx, REWARD_SFX_DURATION_MS } from '../../../shared/audio/sfx'
import { getStoredReverseCountingMaxObjects } from '../../../shared/settings/gameSettings'
import {
  type CountingItem,
  TOTAL_ROUNDS,
  createRound,
  isCorrectAnswer,
} from './gameLogic'
import './ReverseCountingGamePage.css'

type FeedbackState = 'idle' | 'correct' | 'wrong'
const assetsBaseUrl = `${import.meta.env.BASE_URL}assets/illustrations`

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

type TargetCelebrationMotion = {
  '--target-travel-x-mid': string
  '--target-travel-y-mid': string
  '--target-travel-x-late': string
  '--target-travel-y-late': string
  '--target-travel-x-end': string
  '--target-travel-y-end': string
  '--target-rotation-mid': string
  '--target-rotation-late': string
  '--target-rotation-end': string
  '--target-scale-mid': string
  '--target-scale-late': string
  '--target-scale-end': string
  animationName: 'target-voyage-arc' | 'target-voyage-zigzag' | 'target-voyage-spiral'
  animationTimingFunction: string
}

type TargetTone = {
  light: string
  dark: string
}

const targetTonePalette: TargetTone[] = [
  { light: '#ffe8ef', dark: '#be1e4a' },
  { light: '#fff0df', dark: '#c35a00' },
  { light: '#fff8d6', dark: '#947200' },
  { light: '#e8f8db', dark: '#2f7d20' },
  { light: '#dff7f6', dark: '#0f6f72' },
  { light: '#e5efff', dark: '#1f4fb5' },
  { light: '#ebe8ff', dark: '#4b3da5' },
  { light: '#f9e4ff', dark: '#8a2ea7' },
]

function createTargetCelebrationMotion(): TargetCelebrationMotion {
  const animationNames: TargetCelebrationMotion['animationName'][] = [
    'target-voyage-arc',
    'target-voyage-zigzag',
    'target-voyage-spiral',
  ]
  const easingFunctions = [
    'cubic-bezier(0.22, 0.75, 0.22, 1)',
    'cubic-bezier(0.2, 0.95, 0.3, 1)',
    'cubic-bezier(0.32, 0.72, 0.16, 1)',
  ]
  const randomSign = () => (Math.random() < 0.5 ? -1 : 1)

  return {
    '--target-travel-x-mid': `${Math.round((10 + Math.random() * 12) * randomSign())}vw`,
    '--target-travel-y-mid': `${Math.round((-8 - Math.random() * 8) * (0.45 + Math.random() * 0.45))}vh`,
    '--target-travel-x-late': `${Math.round((16 + Math.random() * 16) * randomSign())}vw`,
    '--target-travel-y-late': `${Math.round((-12 - Math.random() * 12) * (0.5 + Math.random() * 0.45))}vh`,
    '--target-travel-x-end': `${Math.round((20 + Math.random() * 22) * randomSign())}vw`,
    '--target-travel-y-end': `${Math.round((-16 - Math.random() * 14) * (0.6 + Math.random() * 0.45))}vh`,
    '--target-rotation-mid': `${Math.round((10 + Math.random() * 18) * randomSign())}deg`,
    '--target-rotation-late': `${Math.round((20 + Math.random() * 26) * randomSign())}deg`,
    '--target-rotation-end': `${Math.round((30 + Math.random() * 34) * randomSign())}deg`,
    '--target-scale-mid': (0.96 + Math.random() * 0.14).toFixed(2),
    '--target-scale-late': (0.85 + Math.random() * 0.12).toFixed(2),
    '--target-scale-end': (0.72 + Math.random() * 0.12).toFixed(2),
    animationName: animationNames[Math.floor(Math.random() * animationNames.length)],
    animationTimingFunction:
      easingFunctions[Math.floor(Math.random() * easingFunctions.length)],
  }
}

function createItemPositions(count: number): ItemPosition[] {
  const baseSize = Math.max(16, Math.min(30, 72 / Math.sqrt(count)))
  const minSize = 11
  const sizeReductionFactor = 0.9
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

export function ReverseCountingGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const maxObjects = getStoredReverseCountingMaxObjects()
  const text = inverseCountingGameTextByLanguage[language]
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

  function handleChoice(choiceId: string) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, choiceId)) {
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      clearActiveTimer()

      const correctChoice = round.choices.find((choice) => choice.id === round.correctChoiceId)
      if (correctChoice) {
        playRewardSfx(correctChoice.item)
      }

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
  const resultTitle = language === 'fr' ? 'Partie terminee !' : 'Game complete!'
  const resultMessage =
    score === TOTAL_ROUNDS
      ? language === 'fr'
        ? 'Sans faute, bravo !'
        : 'Perfect run, amazing!'
      : language === 'fr'
        ? 'Bravo, on continue !'
        : 'Great effort, let us play again!'
  const targetToneStyle = useMemo<CSSProperties>(() => {
    const index = (round.targetCount - 1) % targetTonePalette.length
    const tone = targetTonePalette[index]
    return {
      '--target-color-light': tone.light,
      '--target-color-dark': tone.dark,
    } as CSSProperties
  }, [round.targetCount])
  const targetCelebrationStyle = useMemo<CSSProperties>(() => {
    if (feedback !== 'correct') {
      return {}
    }
    const motion = createTargetCelebrationMotion()
    return {
      ...motion,
      animationDuration: `${REWARD_SFX_DURATION_MS}ms`,
      animationName: motion.animationName,
      animationTimingFunction: motion.animationTimingFunction,
    } as CSSProperties
  }, [feedback])

  const positionsByChoice = useMemo(() => {
    const map = new Map<string, ItemPosition[]>()
    round.choices.forEach((choice) => {
      map.set(choice.id, createItemPositions(choice.count))
    })
    return map
  }, [round])

  return (
    <main className="app-shell reverse-counting-page">
      <header className="reverse-header">
        <h1>{inverseCountingGameNameByLanguage[language]}</h1>
        <div className="header-actions">
          <Link to={`/?lang=${language}`} className="secondary-link">
            ⌂
          </Link>
        </div>
      </header>

      {finished ? (
        <section
          className={`result-card ${score === TOTAL_ROUNDS ? 'is-perfect' : ''}`}
          aria-live="polite"
        >
          <p className="result-emoji" aria-hidden="true">
            🎉
          </p>
          <h2 className="result-title">{resultTitle}</h2>
          <p className="result-score" aria-label={`${score} sur ${TOTAL_ROUNDS}`}>
            <span>{score}</span>
            <span>/{TOTAL_ROUNDS}</span>
          </p>
          <p className="result-message">{resultMessage}</p>
          <div className="result-actions">
            <button
              type="button"
              className="answer-button"
              onClick={restartGame}
              aria-label={language === 'fr' ? 'Rejouer' : 'Play again'}
            >
              ↺
            </button>
            <Link
              to={`/?lang=${language}`}
              className="secondary-link"
              aria-label={language === 'fr' ? 'Retour accueil' : 'Back to home'}
            >
              ⌂
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="target-section" aria-live="polite" style={targetToneStyle}>
            <p className="target-label">{text.answerLabel}</p>
            <p
              className={`target-number ${feedback === 'correct' ? 'is-celebrating' : ''}`}
              style={targetCelebrationStyle}
            >
              {round.targetCount}
            </p>
          </section>

          <section className={`choice-grid ${feedback === 'wrong' ? 'is-wrong' : ''}`}>
            {round.choices.map((choice) => {
              const isCorrectChoice = choice.id === round.correctChoiceId
              const isHighlighted = feedback === 'correct' && isCorrectChoice
              const positions = positionsByChoice.get(choice.id) ?? []

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`choice-card ${isHighlighted ? 'is-correct' : ''}`}
                  onClick={() => handleChoice(choice.id)}
                  disabled={isLocked}
                  aria-label={`${choice.count} ${itemLabels[choice.item]}`}
                >
                  <div className="choice-scene">
                    {positions.map((position, index) => (
                      <div
                        key={`${choice.id}-${index}`}
                        className="item-sprite"
                        style={{
                          left: `${position.left}%`,
                          top: `${position.top}%`,
                          width: `${position.size}%`,
                          height: `${position.size}%`,
                        }}
                        aria-hidden="true"
                      >
                        <img src={imageByItem[choice.item]} alt="" className="item-image" />
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
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

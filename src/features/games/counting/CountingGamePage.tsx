import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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
type ConfettiParticle = {
  id: string
  left: string
  top: string
  color: string
  size: string
  delay: string
  dx: string
  dy: string
  rotation: string
}

const CONFETTI_COLORS = ['#ff6f91', '#ffd166', '#7ed957', '#66d9ff', '#c084ff']
const assetsBaseUrl = `${import.meta.env.BASE_URL}assets/illustrations`

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createConfettiParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `confetti-${index}-${Date.now()}`,
    left: `${randomIntInclusive(12, 88)}%`,
    top: `${randomIntInclusive(38, 64)}%`,
    color: CONFETTI_COLORS[randomIntInclusive(0, CONFETTI_COLORS.length - 1)],
    size: `${randomIntInclusive(8, 14)}px`,
    delay: `${(Math.random() * 0.18).toFixed(2)}s`,
    dx: `${randomIntInclusive(-90, 90)}px`,
    dy: `${randomIntInclusive(-145, -78)}px`,
    rotation: `${randomIntInclusive(-300, 300)}deg`,
  }))
}

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

type CelebrationMotion = {
  '--travel-x-mid': string
  '--travel-y-mid': string
  '--travel-x-end': string
  '--travel-y-end': string
  '--travel-x-late': string
  '--travel-y-late': string
  '--rotation-mid': string
  '--rotation-end': string
  '--rotation-late': string
  '--scale-mid': string
  '--scale-late': string
  '--scale-end': string
  animationName: 'reward-voyage-arc' | 'reward-voyage-zigzag' | 'reward-voyage-spiral'
  animationTimingFunction: string
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

function createCelebrationMotions(count: number): CelebrationMotion[] {
  const animationNames: CelebrationMotion['animationName'][] = [
    'reward-voyage-arc',
    'reward-voyage-zigzag',
    'reward-voyage-spiral',
  ]
  const easingFunctions = [
    'cubic-bezier(0.22, 0.75, 0.22, 1)',
    'cubic-bezier(0.2, 0.95, 0.3, 1)',
    'cubic-bezier(0.32, 0.72, 0.16, 1)',
  ]

  return Array.from({ length: count }, () => {
    const randomSign = () => (Math.random() < 0.5 ? -1 : 1)
    const travelMidX = `${Math.round((20 + Math.random() * 20) * randomSign())}vw`
    const travelMidY = `${Math.round((-22 - Math.random() * 18) * (0.5 + Math.random()))}vh`
    const travelLateX = `${Math.round((28 + Math.random() * 24) * randomSign())}vw`
    const travelLateY = `${Math.round((-30 - Math.random() * 24) * (0.55 + Math.random() * 0.6))}vh`
    const travelEndX = `${Math.round((34 + Math.random() * 28) * randomSign())}vw`
    const travelEndY = `${Math.round((-34 - Math.random() * 26) * (0.65 + Math.random() * 0.5))}vh`
    const rotationMid = `${Math.round((18 + Math.random() * 28) * randomSign())}deg`
    const rotationLate = `${Math.round((35 + Math.random() * 45) * randomSign())}deg`
    const rotationEnd = `${Math.round((58 + Math.random() * 82) * randomSign())}deg`
    const scaleMid = (0.9 + Math.random() * 0.45).toFixed(2)
    const scaleLate = (0.68 + Math.random() * 0.44).toFixed(2)
    const scaleEnd = (0.35 + Math.random() * 0.45).toFixed(2)
    const animationName = animationNames[Math.floor(Math.random() * animationNames.length)]
    const animationTimingFunction =
      easingFunctions[Math.floor(Math.random() * easingFunctions.length)]

    return {
      '--travel-x-mid': travelMidX,
      '--travel-y-mid': travelMidY,
      '--travel-x-late': travelLateX,
      '--travel-y-late': travelLateY,
      '--travel-x-end': travelEndX,
      '--travel-y-end': travelEndY,
      '--rotation-mid': rotationMid,
      '--rotation-late': rotationLate,
      '--rotation-end': rotationEnd,
      '--scale-mid': scaleMid,
      '--scale-late': scaleLate,
      '--scale-end': scaleEnd,
      animationName,
      animationTimingFunction,
    }
  })
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
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
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
      setConfettiParticles(createConfettiParticles(16))
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
    setConfettiParticles([])
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
  const itemPositions = useMemo(
    () => createItemPositions(round.count),
    [round.count],
  )
  const celebrationMotions = useMemo(() => {
    if (feedback !== 'correct') {
      return []
    }
    return createCelebrationMotions(round.count)
  }, [feedback, round.count])

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
          <div className="question-content">
            <section className="counting-stage" aria-label={itemLabels[round.item]}>
              <div
                className={`${sceneClassByItem[round.item]} ${feedback === 'correct' ? 'is-celebrating' : ''}`}
              >
                {itemPositions.map((position, index) => (
                  <div
                    key={`${round.roundIndex}-${round.item}-${index}`}
                    className={`item-sprite ${feedback === 'correct' ? 'is-celebrating' : ''}`}
                    style={{
                      left: `${position.left}%`,
                      top: `${position.top}%`,
                      width: `${position.size}%`,
                      height: `${position.size}%`,
                      animationDuration: feedback === 'correct' ? `${REWARD_SFX_DURATION_MS}ms` : undefined,
                      ...(feedback === 'correct' ? celebrationMotions[index] : {}),
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
          {feedback === 'correct' && confettiParticles.length > 0 ? (
            <div className="micro-confetti" aria-hidden="true">
              {confettiParticles.map((particle) => {
                const style = {
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: `calc(${particle.size} * 0.52)`,
                  backgroundColor: particle.color,
                  animationDelay: particle.delay,
                  '--confetti-dx': particle.dx,
                  '--confetti-dy': particle.dy,
                  '--confetti-rotation': particle.rotation,
                } as CSSProperties
                return <span key={particle.id} className="confetti-piece" style={style} />
              })}
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}

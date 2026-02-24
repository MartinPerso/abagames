import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  commonGameTextByLanguage,
  getGameScoreAriaLabel,
  inverseCountingGameNameByLanguage,
  inverseCountingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import { playRewardSfx, REWARD_SFX_DURATION_MS } from '../../../shared/audio/sfx'
import {
  getStoredReverseCountingAnswerPointerDelaySeconds,
  getStoredReverseCountingAnswerPointerEnabled,
  getStoredReverseCountingMaxObjects,
} from '../../../shared/settings/gameSettings'
import {
  type CountingItem,
  TOTAL_ROUNDS,
  createRound,
  isCorrectAnswer,
} from './gameLogic'
import './ReverseCountingGamePage.css'

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
const CONFETTI_DURATION_SECONDS = 5
const BASE_CONFETTI_DURATION_SECONDS = 0.8
const CONFETTI_TRAVEL_MULTIPLIER =
  CONFETTI_DURATION_SECONDS / BASE_CONFETTI_DURATION_SECONDS
const ANSWER_POINTER_VISIBLE_MS = 4000
const assetsBaseUrl = `${import.meta.env.BASE_URL}assets/illustrations`

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createConfettiParticles(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `confetti-${index}-${Date.now()}`,
    left: `${randomIntInclusive(2, 98)}%`,
    top: `${randomIntInclusive(4, 96)}%`,
    color: CONFETTI_COLORS[randomIntInclusive(0, CONFETTI_COLORS.length - 1)],
    size: `${randomIntInclusive(8, 14)}px`,
    delay: `${(Math.random() * 0.32).toFixed(2)}s`,
    dx: `${randomIntInclusive(
      Math.round(-90 * CONFETTI_TRAVEL_MULTIPLIER),
      Math.round(90 * CONFETTI_TRAVEL_MULTIPLIER),
    )}px`,
    dy: `${randomIntInclusive(
      Math.round(-145 * CONFETTI_TRAVEL_MULTIPLIER),
      Math.round(-78 * CONFETTI_TRAVEL_MULTIPLIER),
    )}px`,
    rotation: `${randomIntInclusive(
      Math.round(-300 * CONFETTI_TRAVEL_MULTIPLIER),
      Math.round(300 * CONFETTI_TRAVEL_MULTIPLIER),
    )}deg`,
  }))
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
  const answerPointerEnabled = getStoredReverseCountingAnswerPointerEnabled()
  const answerPointerDelayMs = getStoredReverseCountingAnswerPointerDelaySeconds() * 1000
  const commonText = commonGameTextByLanguage[language]
  const text = inverseCountingGameTextByLanguage[language]
  const itemLabels = itemLabelByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0, maxObjects))
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [showAnswerPointer, setShowAnswerPointer] = useState(false)
  const timerRef = useRef<number | null>(null)
  const answerPointerTimerRef = useRef<number | null>(null)
  const answerPointerHideTimerRef = useRef<number | null>(null)

  function clearActiveTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function clearAnswerPointerTimer() {
    if (answerPointerTimerRef.current !== null) {
      window.clearTimeout(answerPointerTimerRef.current)
      answerPointerTimerRef.current = null
    }
    if (answerPointerHideTimerRef.current !== null) {
      window.clearTimeout(answerPointerHideTimerRef.current)
      answerPointerHideTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearActiveTimer()
      clearAnswerPointerTimer()
    }
  }, [])

  useEffect(() => {
    if (roundIndex >= TOTAL_ROUNDS || !answerPointerEnabled || isLocked || feedback === 'correct') {
      return
    }

    clearAnswerPointerTimer()
    setShowAnswerPointer(false)
    answerPointerTimerRef.current = window.setTimeout(() => {
      setShowAnswerPointer(true)
      answerPointerHideTimerRef.current = window.setTimeout(() => {
        setShowAnswerPointer(false)
      }, ANSWER_POINTER_VISIBLE_MS)
    }, answerPointerDelayMs)

    return () => {
      clearAnswerPointerTimer()
    }
  }, [answerPointerDelayMs, answerPointerEnabled, feedback, isLocked, round.roundIndex, roundIndex])

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
    setShowAnswerPointer(false)
  }

  function handleChoice(choiceId: string) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, choiceId)) {
      setConfettiParticles(createConfettiParticles(400))
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      setShowAnswerPointer(false)
      clearActiveTimer()
      clearAnswerPointerTimer()

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
    clearAnswerPointerTimer()
    setConfettiParticles([])
    setRoundIndex(0)
    setRound(createRound(0, maxObjects))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
    setShowAnswerPointer(false)
  }

  const finished = roundIndex >= TOTAL_ROUNDS
  const resultTitle = commonText.resultTitle
  const resultMessage =
    score === TOTAL_ROUNDS
      ? commonText.perfectResultMessage
      : commonText.continueResultMessage
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
          <p className="result-score" aria-label={getGameScoreAriaLabel(language, score, TOTAL_ROUNDS)}>
            <span>{score}</span>
            <span>/{TOTAL_ROUNDS}</span>
          </p>
          <p className="result-message">{resultMessage}</p>
          <div className="result-actions">
            <button
              type="button"
              className="answer-button"
              onClick={restartGame}
              aria-label={commonText.playAgainLabel}
            >
              ↺
            </button>
            <Link
              to={`/?lang=${language}`}
              className="secondary-link"
              aria-label={commonText.backHomeLabel}
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
                  className={`choice-card ${isHighlighted ? 'is-correct' : ''} ${feedback !== 'correct' && showAnswerPointer && isCorrectChoice ? 'is-pointer-target' : ''}`}
                  onClick={() => handleChoice(choice.id)}
                  disabled={isLocked}
                  aria-label={`${choice.count} ${itemLabels[choice.item]}`}
                >
                  {feedback !== 'correct' && showAnswerPointer && isCorrectChoice ? (
                    <span className="answer-pointer" aria-hidden="true">
                      👉
                    </span>
                  ) : null}
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
          </section>
        </>
      )}
    </main>
  )
}

import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  commonGameTextByLanguage,
  countingGameNameByLanguage,
  countingGameTextByLanguage,
  getGameScoreAriaLabel,
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
import {
  COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS,
  getStoredCountingHintFirstDelaySeconds,
  getStoredCountingHintRepeatDelaySeconds,
  getStoredCountingAnswerPointerDelaySeconds,
  getStoredCountingAnswerPointerEnabled,
  getStoredCountingMaxObjects,
  getStoredSpeechVoiceUri,
} from '../../../shared/settings/gameSettings'
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
const CONFETTI_DURATION_SECONDS = 5
const BASE_CONFETTI_DURATION_SECONDS = 0.8
const CONFETTI_TRAVEL_MULTIPLIER =
  CONFETTI_DURATION_SECONDS / BASE_CONFETTI_DURATION_SECONDS
const HINT_COUNT_STEP_MS = 900
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
    'cubic-bezier(0.28, 0.62, 0.24, 1)',
    'cubic-bezier(0.3, 0.68, 0.24, 1)',
    'cubic-bezier(0.34, 0.64, 0.2, 1)',
  ]

  return Array.from({ length: count }, () => {
    const randomSign = () => (Math.random() < 0.5 ? -1 : 1)
    const travelMidX = `${Math.round((16 + Math.random() * 14) * randomSign())}vw`
    const travelMidY = `${Math.round((-18 - Math.random() * 12) * (0.5 + Math.random() * 0.8))}vh`
    const travelLateX = `${Math.round((22 + Math.random() * 18) * randomSign())}vw`
    const travelLateY = `${Math.round((-24 - Math.random() * 18) * (0.55 + Math.random() * 0.5))}vh`
    const travelEndX = `${Math.round((26 + Math.random() * 20) * randomSign())}vw`
    const travelEndY = `${Math.round((-26 - Math.random() * 20) * (0.6 + Math.random() * 0.4))}vh`
    const rotationMid = `${Math.round((14 + Math.random() * 20) * randomSign())}deg`
    const rotationLate = `${Math.round((28 + Math.random() * 34) * randomSign())}deg`
    const rotationEnd = `${Math.round((44 + Math.random() * 56) * randomSign())}deg`
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
  const hintFirstDelaySeconds = getStoredCountingHintFirstDelaySeconds()
  const hintsDisabled = hintFirstDelaySeconds === COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS
  const hintFirstDelayMs = hintFirstDelaySeconds * 1000
  const hintRepeatDelayMs = getStoredCountingHintRepeatDelaySeconds() * 1000
  const answerPointerEnabled = getStoredCountingAnswerPointerEnabled()
  const answerPointerDelayMs = getStoredCountingAnswerPointerDelaySeconds() * 1000
  const answerOptions = getAnswerOptions(maxObjects)
  const commonText = commonGameTextByLanguage[language]
  const text = countingGameTextByLanguage[language]
  const itemLabels = itemLabelByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0, maxObjects))
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [activeHintSpriteIndex, setActiveHintSpriteIndex] = useState<number | null>(null)
  const [showAnswerPointer, setShowAnswerPointer] = useState(false)
  const answerTimerRef = useRef<number | null>(null)
  const hintStartTimerRef = useRef<number | null>(null)
  const hintStepTimerRef = useRef<number | null>(null)
  const hintRepeatTimerRef = useRef<number | null>(null)
  const answerPointerTimerRef = useRef<number | null>(null)

  const itemPositions = useMemo(
    () => createItemPositions(round.count),
    [round.count],
  )
  const hintOrder = useMemo(() => {
    return itemPositions
      .map((position, index) => ({
        index,
        left: position.left,
        top: position.top,
      }))
      .sort((a, b) => {
        if (a.top !== b.top) {
          return a.top - b.top
        }
        return a.left - b.left
      })
      .map((position) => position.index)
  }, [itemPositions])
  function clearAnswerTimer() {
    if (answerTimerRef.current !== null) {
      window.clearTimeout(answerTimerRef.current)
      answerTimerRef.current = null
    }
  }

  function clearAnswerPointerTimer() {
    if (answerPointerTimerRef.current !== null) {
      window.clearTimeout(answerPointerTimerRef.current)
      answerPointerTimerRef.current = null
    }
  }

  function clearHintTimers() {
    if (hintStartTimerRef.current !== null) {
      window.clearTimeout(hintStartTimerRef.current)
      hintStartTimerRef.current = null
    }
    if (hintStepTimerRef.current !== null) {
      window.clearTimeout(hintStepTimerRef.current)
      hintStepTimerRef.current = null
    }
    if (hintRepeatTimerRef.current !== null) {
      window.clearTimeout(hintRepeatTimerRef.current)
      hintRepeatTimerRef.current = null
    }
  }

  const stopSpeech = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.speechSynthesis?.cancel()
  }, [])

  const speakHintCount = useCallback((value: number) => {
    if (typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis
    if (!synth) {
      return
    }

    stopSpeech()
    const utterance = new SpeechSynthesisUtterance(String(value))
    const selectedVoiceUri = getStoredSpeechVoiceUri()
    const selectedVoice = selectedVoiceUri
      ? synth.getVoices().find((voice) => voice.voiceURI === selectedVoiceUri)
      : undefined
    const expectedLangPrefix = language === 'fr' ? 'fr' : 'en'
    if (selectedVoice && selectedVoice.lang.toLowerCase().startsWith(expectedLangPrefix)) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    } else {
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
    }
    utterance.rate = 0.78
    utterance.pitch = 1
    synth.speak(utterance)
  }, [language, stopSpeech])

  function stopHintSequence() {
    clearHintTimers()
    setActiveHintSpriteIndex(null)
    stopSpeech()
  }

  useEffect(() => {
    return () => {
      clearAnswerTimer()
      clearHintTimers()
      clearAnswerPointerTimer()
      stopSpeech()
    }
  }, [stopSpeech])

  useEffect(() => {
    if (roundIndex >= TOTAL_ROUNDS || hintsDisabled) {
      return
    }

    clearHintTimers()
    setActiveHintSpriteIndex(null)

    const runHintStep = (stepIndex: number) => {
      if (stepIndex >= hintOrder.length) {
        setActiveHintSpriteIndex(null)
        hintRepeatTimerRef.current = window.setTimeout(() => {
          runHintStep(0)
        }, hintRepeatDelayMs)
        return
      }

      setActiveHintSpriteIndex(hintOrder[stepIndex])
      speakHintCount(stepIndex + 1)
      hintStepTimerRef.current = window.setTimeout(() => {
        runHintStep(stepIndex + 1)
      }, HINT_COUNT_STEP_MS)
    }

    hintStartTimerRef.current = window.setTimeout(() => {
      runHintStep(0)
    }, hintFirstDelayMs)

    return () => {
      clearHintTimers()
      stopSpeech()
    }
  }, [
    hintsDisabled,
    hintFirstDelayMs,
    hintRepeatDelayMs,
    hintOrder,
    round.roundIndex,
    roundIndex,
    speakHintCount,
    stopSpeech,
  ])

  useEffect(() => {
    if (roundIndex >= TOTAL_ROUNDS || !answerPointerEnabled || isLocked || feedback === 'correct') {
      return
    }

    clearAnswerPointerTimer()
    setShowAnswerPointer(false)
    answerPointerTimerRef.current = window.setTimeout(() => {
      setShowAnswerPointer(true)
    }, answerPointerDelayMs)

    return () => {
      clearAnswerPointerTimer()
    }
  }, [
    answerPointerDelayMs,
    answerPointerEnabled,
    feedback,
    isLocked,
    round.roundIndex,
    roundIndex,
  ])

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
    setActiveHintSpriteIndex(null)
    setShowAnswerPointer(false)
  }

  function handleAnswer(answer: number) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, answer)) {
      setConfettiParticles(createConfettiParticles(400))
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      setActiveHintSpriteIndex(null)
      setShowAnswerPointer(false)
      clearAnswerTimer()
      stopHintSequence()
      clearAnswerPointerTimer()
      playRewardSfx(round.item)

      answerTimerRef.current = window.setTimeout(() => {
        moveToNextRound()
      }, REWARD_SFX_DURATION_MS)
      return
    }

    setFeedback('wrong')
    clearAnswerTimer()
    answerTimerRef.current = window.setTimeout(() => {
      setFeedback('idle')
    }, 700)
  }

  function restartGame() {
    clearAnswerTimer()
    stopHintSequence()
    clearAnswerPointerTimer()
    setConfettiParticles([])
    setRoundIndex(0)
    setRound(createRound(0, maxObjects))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
    setActiveHintSpriteIndex(null)
    setShowAnswerPointer(false)
  }

  const finished = roundIndex >= TOTAL_ROUNDS
  const resultTitle = commonText.resultTitle
  const resultMessage =
    score === TOTAL_ROUNDS
      ? commonText.perfectResultMessage
      : commonText.continueResultMessage
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
          <div className="question-content">
            <section className="counting-stage" aria-label={itemLabels[round.item]}>
              <div
                className={`${sceneClassByItem[round.item]} ${feedback === 'correct' ? 'is-celebrating' : ''}`}
              >
                {itemPositions.map((position, index) => {
                  const isHinting = feedback !== 'correct' && activeHintSpriteIndex === index
                  return (
                    <div
                      key={`${round.roundIndex}-${round.item}-${index}`}
                      className={`item-sprite ${feedback === 'correct' ? 'is-celebrating' : ''} ${isHinting ? 'is-hinting' : ''}`}
                      style={{
                        left: `${position.left}%`,
                        top: `${position.top}%`,
                        width: `${position.size}%`,
                        height: `${position.size}%`,
                        zIndex: isHinting ? 8 : undefined,
                        animationDuration:
                          feedback === 'correct' ? `${REWARD_SFX_DURATION_MS}ms` : undefined,
                        ...(feedback === 'correct' ? celebrationMotions[index] : {}),
                      }}
                      aria-hidden="true"
                    >
                      <img src={imageByItem[round.item]} alt="" className="item-image" />
                    </div>
                  )
                })}
              </div>
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
                  className={`answer-button ${feedback === 'correct' && value === round.count ? 'is-correct-answer' : ''} ${feedback !== 'correct' && showAnswerPointer && value === round.count ? 'is-pointer-target' : ''}`}
                  onClick={() => handleAnswer(value)}
                  disabled={isLocked}
                >
                  <span className="answer-value">{value}</span>
                  {feedback !== 'correct' && showAnswerPointer && value === round.count ? (
                    <span className="answer-pointer" aria-hidden="true">
                      👉
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

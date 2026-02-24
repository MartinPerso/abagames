import { Link, useSearchParams } from 'react-router-dom'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  commonGameTextByLanguage,
  getGameScoreAriaLabel,
  letterListeningGameNameByLanguage,
  letterListeningGameTextByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import {
  getStoredLetterListeningAllowedLetters,
  getStoredLetterListeningAnswerPointerDelaySeconds,
  getStoredLetterListeningAnswerPointerEnabled,
  getStoredSpeechVoiceUri,
} from '../../../shared/settings/gameSettings'
import { TOTAL_ROUNDS, createRound, isCorrectAnswer } from './gameLogic'
import './LetterListeningGamePage.css'

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

type LetterMaskData = {
  size: number
  mask: Uint8Array
  totalPixels: number
}

type ActiveStroke = {
  pointerId: number
  pathId: string
  x: number
  y: number
}

type LetterColoringRewardProps = {
  letter: string
  instructionLabel: string
  onComplete: () => void
}

const CONFETTI_COLORS = ['#ff6f91', '#ffd166', '#7ed957', '#66d9ff', '#c084ff']
const CONFETTI_DURATION_SECONDS = 5
const BASE_CONFETTI_DURATION_SECONDS = 0.8
const CONFETTI_TRAVEL_MULTIPLIER =
  CONFETTI_DURATION_SECONDS / BASE_CONFETTI_DURATION_SECONDS
const LETTER_PROMPT_TONES = [
  { start: '#ffe8ef', middle: '#fff4d9', end: '#dff7f6' },
  { start: '#fff0df', middle: '#fff8d6', end: '#e8f8db' },
  { start: '#e8f8db', middle: '#dff7f6', end: '#e5efff' },
  { start: '#dff7f6', middle: '#e5efff', end: '#ebe8ff' },
  { start: '#e5efff', middle: '#ebe8ff', end: '#f9e4ff' },
  { start: '#f9e4ff', middle: '#ffe8ef', end: '#fff0df' },
] as const
const REWARD_VIEWBOX_SIZE = 100
const REWARD_MASK_SIZE = 170
const REWARD_BRUSH_RADIUS = 9.4
const REWARD_FILL_THRESHOLD = 0.9
const REWARD_COMPLETE_DELAY_MS = 500
const REWARD_RESULT_VISIBLE_MS = 5000
const ANSWER_POINTER_VISIBLE_MS = 4000
const LETTER_SPEECH_DELAY_MS = 500
const REWARD_FONT_FAMILY =
  '"Avenir Next Rounded", "Arial Rounded MT Bold", "Avenir Next", "Inter", sans-serif'

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLocalRewardPoint(
  target: HTMLDivElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = target.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  return {
    x: clampNumber(((clientX - rect.left) / rect.width) * REWARD_VIEWBOX_SIZE, 0, REWARD_VIEWBOX_SIZE),
    y: clampNumber(((clientY - rect.top) / rect.height) * REWARD_VIEWBOX_SIZE, 0, REWARD_VIEWBOX_SIZE),
  }
}

function createLetterMaskData(letter: string): LetterMaskData | null {
  if (typeof document === 'undefined') {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = REWARD_MASK_SIZE
  canvas.height = REWARD_MASK_SIZE

  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  context.clearRect(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  context.fillStyle = '#000000'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  let fontSize = REWARD_MASK_SIZE * 0.84
  while (fontSize >= REWARD_MASK_SIZE * 0.48) {
    context.font = `900 ${fontSize}px ${REWARD_FONT_FAMILY}`
    const metrics = context.measureText(letter)
    const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    if (metrics.width <= REWARD_MASK_SIZE * 0.78 && glyphHeight <= REWARD_MASK_SIZE * 0.82) {
      break
    }
    fontSize -= 2
  }

  context.fillText(letter, REWARD_MASK_SIZE / 2, REWARD_MASK_SIZE / 2)
  const imageData = context.getImageData(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  const mask = new Uint8Array(REWARD_MASK_SIZE * REWARD_MASK_SIZE)
  let totalPixels = 0

  for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex += 1) {
    if (imageData.data[pixelIndex * 4 + 3] < 28) {
      continue
    }
    mask[pixelIndex] = 1
    totalPixels += 1
  }

  return {
    size: REWARD_MASK_SIZE,
    mask,
    totalPixels,
  }
}

function markCoverageCircle(
  centerX: number,
  centerY: number,
  radius: number,
  maskData: LetterMaskData,
  visitedPixels: Uint8Array,
): number {
  const startX = clampNumber(Math.floor(centerX - radius), 0, maskData.size - 1)
  const endX = clampNumber(Math.ceil(centerX + radius), 0, maskData.size - 1)
  const startY = clampNumber(Math.floor(centerY - radius), 0, maskData.size - 1)
  const endY = clampNumber(Math.ceil(centerY + radius), 0, maskData.size - 1)
  const radiusSquared = radius * radius
  let addedPixels = 0

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const dx = x - centerX
      const dy = y - centerY
      if (dx * dx + dy * dy > radiusSquared) {
        continue
      }

      const pixelIndex = y * maskData.size + x
      if (maskData.mask[pixelIndex] === 0 || visitedPixels[pixelIndex] === 1) {
        continue
      }

      visitedPixels[pixelIndex] = 1
      addedPixels += 1
    }
  }

  return addedPixels
}

function markCoverageSegment(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  maskData: LetterMaskData,
  visitedPixels: Uint8Array,
): number {
  const scale = maskData.size / REWARD_VIEWBOX_SIZE
  const radius = REWARD_BRUSH_RADIUS * scale
  const dx = toX - fromX
  const dy = toY - fromY
  const distance = Math.hypot(dx, dy)
  const steps = Math.max(1, Math.ceil(distance / (REWARD_BRUSH_RADIUS * 0.5)))
  let addedPixels = 0

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps
    const x = (fromX + dx * t) * scale
    const y = (fromY + dy * t) * scale
    addedPixels += markCoverageCircle(x, y, radius, maskData, visitedPixels)
  }

  return addedPixels
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

function LetterColoringReward({ letter, instructionLabel, onComplete }: LetterColoringRewardProps) {
  const [paths, setPaths] = useState<Array<{ id: string; d: string }>>([])
  const [progress, setProgress] = useState(0)
  const clipPathId = useId().replace(/:/g, '')
  const maskDataRef = useRef<LetterMaskData | null>(null)
  const visitedPixelsRef = useRef<Uint8Array>(new Uint8Array(0))
  const coveredPixelsRef = useRef(0)
  const progressRef = useRef(0)
  const completionScheduledRef = useRef(false)
  const completionTimerRef = useRef<number | null>(null)
  const activeStrokeRef = useRef<ActiveStroke | null>(null)

  useEffect(() => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current)
      completionTimerRef.current = null
    }

    const maskData = createLetterMaskData(letter)
    maskDataRef.current = maskData
    visitedPixelsRef.current = new Uint8Array(maskData?.size ? maskData.size * maskData.size : 0)
    coveredPixelsRef.current = 0
    progressRef.current = 0
    completionScheduledRef.current = false
    activeStrokeRef.current = null
    setPaths([])
    setProgress(0)

    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current)
        completionTimerRef.current = null
      }
    }
  }, [letter])

  const updateRewardProgress = useCallback(
    (addedPixels: number) => {
      if (addedPixels <= 0) {
        return
      }

      const maskData = maskDataRef.current
      if (!maskData || maskData.totalPixels === 0) {
        return
      }

      coveredPixelsRef.current += addedPixels
      const nextProgress = Math.min(1, coveredPixelsRef.current / maskData.totalPixels)
      progressRef.current = nextProgress
      setProgress((current) => (nextProgress > current ? nextProgress : current))
    },
    [],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (completionScheduledRef.current) {
        return
      }

      const localPoint = getLocalRewardPoint(event.currentTarget, event.clientX, event.clientY)
      if (!localPoint) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)

      const pathId = `${event.pointerId}-${Date.now()}-${Math.round(Math.random() * 10_000)}`
      const startPoint = `${localPoint.x.toFixed(2)} ${localPoint.y.toFixed(2)}`
      setPaths((current) => [...current, { id: pathId, d: `M ${startPoint}` }])

      activeStrokeRef.current = {
        pointerId: event.pointerId,
        pathId,
        x: localPoint.x,
        y: localPoint.y,
      }

      const maskData = maskDataRef.current
      if (!maskData) {
        return
      }

      const addedPixels = markCoverageSegment(
        localPoint.x,
        localPoint.y,
        localPoint.x,
        localPoint.y,
        maskData,
        visitedPixelsRef.current,
      )
      updateRewardProgress(addedPixels)
    },
    [updateRewardProgress],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeStroke = activeStrokeRef.current
      if (!activeStroke || activeStroke.pointerId !== event.pointerId || completionScheduledRef.current) {
        return
      }

      const localPoint = getLocalRewardPoint(event.currentTarget, event.clientX, event.clientY)
      if (!localPoint) {
        return
      }

      event.preventDefault()

      const segment = ` L ${localPoint.x.toFixed(2)} ${localPoint.y.toFixed(2)}`
      setPaths((current) => {
        return current.map((path) =>
          path.id === activeStroke.pathId ? { ...path, d: `${path.d}${segment}` } : path,
        )
      })

      const maskData = maskDataRef.current
      if (maskData) {
        const addedPixels = markCoverageSegment(
          activeStroke.x,
          activeStroke.y,
          localPoint.x,
          localPoint.y,
          maskData,
          visitedPixelsRef.current,
        )
        updateRewardProgress(addedPixels)
      }

      activeStrokeRef.current = {
        ...activeStroke,
        x: localPoint.x,
        y: localPoint.y,
      }
    },
    [updateRewardProgress],
  )

  const endStroke = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeStroke = activeStrokeRef.current
      if (!activeStroke || activeStroke.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      activeStrokeRef.current = null

      if (
        event.type === 'pointerup' &&
        progressRef.current >= REWARD_FILL_THRESHOLD &&
        !completionScheduledRef.current
      ) {
        completionScheduledRef.current = true
        completionTimerRef.current = window.setTimeout(() => {
          completionTimerRef.current = null
          onComplete()
        }, REWARD_COMPLETE_DELAY_MS)
      }
    },
    [onComplete],
  )

  return (
    <div className="letter-reward">
      <div
        className="letter-reward-stage"
        role="img"
        aria-label={`${instructionLabel}: ${letter}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      >
        <svg className="letter-reward-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <clipPath id={clipPathId}>
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="reward-letter-shape">
                {letter}
              </text>
            </clipPath>
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="rgba(255, 255, 255, 0.66)" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="reward-letter-base">
            {letter}
          </text>
          <g clipPath={`url(#${clipPathId})`}>
            {paths.map((path) => (
              <path key={path.id} d={path.d} className="reward-brush-stroke" />
            ))}
          </g>
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="reward-letter-outline">
            {letter}
          </text>
        </svg>
      </div>

      <div className="letter-reward-progress" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  )
}

export function LetterListeningGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const answerPointerEnabled = getStoredLetterListeningAnswerPointerEnabled()
  const answerPointerDelayMs = getStoredLetterListeningAnswerPointerDelaySeconds() * 1000
  const commonText = commonGameTextByLanguage[language]
  const text = letterListeningGameTextByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() =>
    createRound(0, getStoredLetterListeningAllowedLetters()),
  )
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [showAnswerPointer, setShowAnswerPointer] = useState(false)
  const timerRef = useRef<number | null>(null)
  const answerPointerTimerRef = useRef<number | null>(null)
  const answerPointerHideTimerRef = useRef<number | null>(null)
  const speechTimerRef = useRef<number | null>(null)

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

  function clearSpeechTimer() {
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
  }

  const stopSpeech = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.speechSynthesis?.cancel()
  }, [])

  const speakLetter = useCallback(
    (letter: string) => {
      if (typeof window === 'undefined') {
        return
      }

      const synth = window.speechSynthesis
      if (!synth) {
        return
      }

      const spokenText = `${text.speechPrefix}${letter}`

      stopSpeech()
      const utterance = new SpeechSynthesisUtterance(spokenText)
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
      utterance.rate = 0.75
      utterance.pitch = 1.05
      synth.speak(utterance)
    },
    [text.speechPrefix, language, stopSpeech],
  )

  useEffect(() => {
    clearSpeechTimer()
    speechTimerRef.current = window.setTimeout(() => {
      speakLetter(round.targetLetter)
    }, LETTER_SPEECH_DELAY_MS)

    return () => {
      clearSpeechTimer()
      stopSpeech()
    }
  }, [round.targetLetter, speakLetter, stopSpeech])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      clearAnswerPointerTimer()
      clearSpeechTimer()
      stopSpeech()
    }
  }, [stopSpeech])

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
      setConfettiParticles([])
      setIsLocked(false)
      setShowAnswerPointer(false)
      return
    }

    const nextIndex = roundIndex + 1
    setRoundIndex(nextIndex)
    setRound(createRound(nextIndex, getStoredLetterListeningAllowedLetters()))
    setFeedback('idle')
    setConfettiParticles([])
    setIsLocked(false)
    setShowAnswerPointer(false)
  }

  function handleAnswer(letter: string) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, letter)) {
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      setShowAnswerPointer(false)
      clearActiveTimer()
      clearAnswerPointerTimer()
      return
    }

    setFeedback('wrong')
    clearActiveTimer()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setFeedback('idle')
    }, 700)
  }

  function handleColoringCompleted() {
    clearActiveTimer()
    setConfettiParticles(createConfettiParticles(400))
    playSuccessJingle()
    triggerLightVibration()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      moveToNextRound()
    }, REWARD_RESULT_VISIBLE_MS)
  }

  function restartGame() {
    clearActiveTimer()
    clearAnswerPointerTimer()
    stopSpeech()
    setRoundIndex(0)
    setRound(createRound(0, getStoredLetterListeningAllowedLetters()))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
    setShowAnswerPointer(false)
    setConfettiParticles([])
  }

  const finished = roundIndex >= TOTAL_ROUNDS
  const resultTitle = commonText.resultTitle
  const resultMessage =
    score === TOTAL_ROUNDS
      ? commonText.perfectResultMessage
      : commonText.continueResultMessage
  const promptToneStyle = useMemo<CSSProperties>(() => {
    const alphabetIndex = round.targetLetter.charCodeAt(0) - 'A'.charCodeAt(0)
    const tone = LETTER_PROMPT_TONES[Math.abs(alphabetIndex) % LETTER_PROMPT_TONES.length]

    return {
      '--prompt-pastel-start': tone.start,
      '--prompt-pastel-middle': tone.middle,
      '--prompt-pastel-end': tone.end,
    } as CSSProperties
  }, [round.targetLetter])

  function playSuccessJingle() {
    if (typeof window === 'undefined') {
      return
    }

    const AudioContextCtor = window.AudioContext
    if (!AudioContextCtor) {
      return
    }

    const context = new AudioContextCtor()
    const now = context.currentTime
    const notes = [659.25, 783.99, 987.77]

    notes.forEach((frequency, index) => {
      const osc = context.createOscillator()
      const gain = context.createGain()
      const start = now + index * 0.09
      const end = start + 0.16

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(frequency, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, end)

      osc.connect(gain)
      gain.connect(context.destination)
      osc.start(start)
      osc.stop(end)
    })

    window.setTimeout(() => {
      void context.close()
    }, 500)
  }

  function triggerLightVibration() {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return
    }

    navigator.vibrate(24)
  }

  return (
    <main className="app-shell letter-listening-page">
      <header className="letter-header">
        <h1>{letterListeningGameNameByLanguage[language]}</h1>
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
          <section
            className={`prompt-card ${feedback === 'correct' ? 'is-flash' : ''}`}
            aria-live="polite"
            style={promptToneStyle}
          >
            <p className="prompt-label">
              {feedback === 'correct' ? text.coloringInstructionLabel : text.instructionLabel}
            </p>
            {feedback === 'correct' ? (
              <LetterColoringReward
                letter={round.targetLetter}
                instructionLabel={text.coloringInstructionLabel}
                onComplete={handleColoringCompleted}
              />
            ) : (
              <button
                type="button"
                className="play-letter-button"
                onClick={() => speakLetter(round.targetLetter)}
                aria-label={text.replayLabel}
                title={text.replayLabel}
              >
                ▶
              </button>
            )}
            {feedback === 'correct' ? (
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

          <section
            className={`answers ${feedback === 'correct' ? 'is-correct' : ''} ${feedback === 'wrong' ? 'is-wrong' : ''}`}
            aria-label={text.answerLabel}
          >
            <div className="answer-grid">
              {round.options.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={`answer-button ${
                    feedback === 'correct' && letter === round.targetLetter ? 'is-correct-answer' : ''
                  } ${feedback !== 'correct' && showAnswerPointer && letter === round.targetLetter ? 'is-pointer-target' : ''}`}
                  onClick={() => handleAnswer(letter)}
                  disabled={isLocked}
                >
                  {letter}
                  {feedback !== 'correct' && showAnswerPointer && letter === round.targetLetter ? (
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

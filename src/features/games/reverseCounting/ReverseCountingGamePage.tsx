import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  inverseCountingGameNameByLanguage,
  inverseCountingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
  quantitySpeechLabelByLanguage,
} from '../../../shared/i18n/i18n'
import { playRewardSfx, REWARD_SFX_DURATION_MS } from '../../../shared/audio/sfx'
import {
  getStoredReverseCountingAnswerPointerDelaySeconds,
  getStoredReverseCountingAnswerPointerEnabled,
  getStoredReverseCountingDiceHintEnabled,
  getStoredReverseCountingMaxObjects,
  getStoredSpeechVoiceUri,
} from '../../../shared/settings/gameSettings'
import { DiceHint } from '../../../shared/ui/DiceHint'
import {
  type CountingItem,
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
const TARGET_SPEECH_DELAY_MS = 1000
const SUCCESS_SEQUENCE_DELAY_MS = 900
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
    'cubic-bezier(0.28, 0.62, 0.24, 1)',
    'cubic-bezier(0.3, 0.68, 0.24, 1)',
    'cubic-bezier(0.34, 0.64, 0.2, 1)',
  ]
  const randomSign = () => (Math.random() < 0.5 ? -1 : 1)

  return {
    '--target-travel-x-mid': `${Math.round((8 + Math.random() * 9) * randomSign())}vw`,
    '--target-travel-y-mid': `${Math.round((-7 - Math.random() * 6) * (0.45 + Math.random() * 0.35))}vh`,
    '--target-travel-x-late': `${Math.round((12 + Math.random() * 11) * randomSign())}vw`,
    '--target-travel-y-late': `${Math.round((-10 - Math.random() * 8) * (0.5 + Math.random() * 0.35))}vh`,
    '--target-travel-x-end': `${Math.round((15 + Math.random() * 13) * randomSign())}vw`,
    '--target-travel-y-end': `${Math.round((-13 - Math.random() * 9) * (0.55 + Math.random() * 0.35))}vh`,
    '--target-rotation-mid': `${Math.round((8 + Math.random() * 14) * randomSign())}deg`,
    '--target-rotation-late': `${Math.round((14 + Math.random() * 20) * randomSign())}deg`,
    '--target-rotation-end': `${Math.round((22 + Math.random() * 24) * randomSign())}deg`,
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
  const diceHintEnabled = getStoredReverseCountingDiceHintEnabled()
  const text = inverseCountingGameTextByLanguage[language]
  const itemLabels = itemLabelByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0, maxObjects))
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [showAnswerPointer, setShowAnswerPointer] = useState(false)
  const timerRef = useRef<number | null>(null)
  const answerPointerTimerRef = useRef<number | null>(null)
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

  const speakTargetCount = useCallback(
    (targetCount: number) => {
      if (typeof window === 'undefined') {
        return
      }

      const synth = window.speechSynthesis
      if (!synth) {
        return
      }

      stopSpeech()
      const utterance = new SpeechSynthesisUtterance(`${text.speechPrefix}${targetCount}`)
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
      utterance.rate = 0.76
      utterance.pitch = 1
      synth.speak(utterance)
    },
    [language, stopSpeech, text.speechPrefix],
  )

  const speakChoice = useCallback(
    (item: CountingItem, count: number) => {
      if (typeof window === 'undefined') {
        return
      }

      const synth = window.speechSynthesis
      if (!synth) {
        return
      }

      stopSpeech()
      const labels = quantitySpeechLabelByLanguage[language][item]
      const noun = count > 1 ? labels.plural : labels.singular
      const utterance = new SpeechSynthesisUtterance(`${count} ${noun}`)
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
      utterance.rate = 0.76
      utterance.pitch = 1
      synth.speak(utterance)
    },
    [language, stopSpeech],
  )

  const speakBravo = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    const synth = window.speechSynthesis
    if (!synth) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text.bravoAlert)
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
    utterance.rate = 0.82
    utterance.pitch = 1.08
    synth.speak(utterance)
  }, [language, text.bravoAlert])

  useEffect(() => {
    return () => {
      clearActiveTimer()
      clearAnswerPointerTimer()
      clearSpeechTimer()
      stopSpeech()
    }
  }, [stopSpeech])

  useEffect(() => {
    clearSpeechTimer()
    speechTimerRef.current = window.setTimeout(() => {
      speakTargetCount(round.targetCount)
    }, TARGET_SPEECH_DELAY_MS)

    return () => {
      clearSpeechTimer()
    }
  }, [round.roundIndex, round.targetCount, speakTargetCount])

  useEffect(() => {
    if (!answerPointerEnabled || isLocked || feedback === 'correct') {
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
  }, [answerPointerDelayMs, answerPointerEnabled, feedback, isLocked, round.roundIndex, roundIndex])

  function moveToNextRound() {
    const nextIndex = roundIndex + 1
    setRoundIndex(nextIndex)
    setRound(createRound(nextIndex, maxObjects))
    setFeedback('idle')
    setConfettiParticles([])
    setIsLocked(false)
    setShowAnswerPointer(false)
  }

  function handleChoice(choiceId: string) {
    if (isLocked) {
      return
    }

    const selectedChoice = round.choices.find((choice) => choice.id === choiceId)
    clearSpeechTimer()
    if (selectedChoice) {
      speakChoice(selectedChoice.item, selectedChoice.count)
    }

    if (isCorrectAnswer(round, choiceId)) {
      setIsLocked(true)
      setShowAnswerPointer(false)
      clearActiveTimer()
      clearAnswerPointerTimer()
      clearSpeechTimer()
      const correctChoice = round.choices.find((choice) => choice.id === round.correctChoiceId)

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setConfettiParticles(createConfettiParticles(400))
        setFeedback('correct')
        if (correctChoice) {
          playRewardSfx(correctChoice.item)
        }
        speakBravo()
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null
          moveToNextRound()
        }, REWARD_SFX_DURATION_MS)
      }, SUCCESS_SEQUENCE_DELAY_MS)
      return
    }

    setFeedback('wrong')
    clearActiveTimer()
    timerRef.current = window.setTimeout(() => {
      setFeedback('idle')
    }, 700)
  }
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

      <section className="target-section" aria-live="polite" style={targetToneStyle}>
        <p className="target-label">{text.answerLabel}</p>
        <p
          className={`target-number ${feedback === 'correct' ? 'is-celebrating' : ''}`}
          style={targetCelebrationStyle}
        >
          <span className="target-number-content">
            <span>{round.targetCount}</span>
            {diceHintEnabled ? <DiceHint value={round.targetCount} className="target-dice-hint" /> : null}
          </span>
        </p>
        {feedback !== 'correct' ? (
          <button
            type="button"
            className="target-replay-button"
            onClick={() => speakTargetCount(round.targetCount)}
            disabled={isLocked}
            aria-label={text.replayLabel}
            title={text.replayLabel}
          >
            ▶
          </button>
        ) : null}
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
    </main>
  )
}

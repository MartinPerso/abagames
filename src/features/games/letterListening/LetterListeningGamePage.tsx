import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  letterListeningGameNameByLanguage,
  letterListeningGameTextByLanguage,
  parseLanguageParam,
  superRewardUiTextByLanguage,
} from '../../../shared/i18n/i18n'
import {
  getStoredLetterListeningAllowedLetters,
  getStoredLetterListeningAnswerPointerDelaySeconds,
  getStoredLetterListeningAnswerPointerEnabled,
  getStoredLetterListeningAnswerRevealDelaySeconds,
  getStoredLetterListeningSuperRewardFirstTryStreak,
  getStoredLetterListeningSuperRewardEnabled,
  getStoredSpeechVoiceUri,
  getStoredSuperRewardVideos,
} from '../../../shared/settings/gameSettings'
import { toPlayableSuperRewardVideo } from '../../../shared/rewards/superRewardVideo'
import { getStoredLocalRewardVideoBlob } from '../../../shared/storage/localRewardVideoStore'
import { playSuccessJingle, triggerLightVibration } from '../../../shared/audio/sfx'
import { createRound, isCorrectAnswer } from './gameLogic'
import {
  SuperRewardVideoModal,
  type SuperRewardVideoPlayback,
} from '../../../shared/ui/SuperRewardVideoModal'
import {
  COLORING_REWARD_RESULT_VISIBLE_MS,
  GlyphColoringReward,
} from '../../../shared/ui/GlyphColoringReward'
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
const LETTER_SPEECH_DELAY_MS = 500
const SUCCESS_SEQUENCE_DELAY_MS = 900

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

export function LetterListeningGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const answerPointerEnabled = getStoredLetterListeningAnswerPointerEnabled()
  const answerPointerDelayMs = getStoredLetterListeningAnswerPointerDelaySeconds() * 1000
  const answerRevealDelayMs = getStoredLetterListeningAnswerRevealDelaySeconds() * 1000
  const superRewardEnabled = getStoredLetterListeningSuperRewardEnabled()
  const superRewardFirstTryStreakTarget = getStoredLetterListeningSuperRewardFirstTryStreak()
  const playableSuperRewardVideos = getStoredSuperRewardVideos()
    .filter((video) => video.enabled)
    .map((video) => toPlayableSuperRewardVideo(video))
    .filter((video): video is NonNullable<ReturnType<typeof toPlayableSuperRewardVideo>> => video !== null)
  const text = letterListeningGameTextByLanguage[language]
  const superRewardText = superRewardUiTextByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() =>
    createRound(0, getStoredLetterListeningAllowedLetters()),
  )
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [isLocked, setIsLocked] = useState(false)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [showAnswerPointer, setShowAnswerPointer] = useState(false)
  const [areAnswersVisible, setAreAnswersVisible] = useState(answerRevealDelayMs <= 0)
  const [animateAnswerReveal, setAnimateAnswerReveal] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [wrongLetters, setWrongLetters] = useState<string[]>([])
  const [activeSuperRewardPlayback, setActiveSuperRewardPlayback] =
    useState<SuperRewardVideoPlayback | null>(null)
  const [firstTryCorrectStreak, setFirstTryCorrectStreak] = useState(0)
  const timerRef = useRef<number | null>(null)
  const answerPointerTimerRef = useRef<number | null>(null)
  const answerRevealTimerRef = useRef<number | null>(null)
  const speechTimerRef = useRef<number | null>(null)
  const superRewardCloseTimerRef = useRef<number | null>(null)
  const activeLocalRewardUrlRef = useRef<string | null>(null)
  const superRewardLaunchTokenRef = useRef(0)

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

  function clearAnswerRevealTimer() {
    if (answerRevealTimerRef.current !== null) {
      window.clearTimeout(answerRevealTimerRef.current)
      answerRevealTimerRef.current = null
    }
  }

  function clearSpeechTimer() {
    if (speechTimerRef.current !== null) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
  }

  function clearSuperRewardCloseTimer() {
    if (superRewardCloseTimerRef.current !== null) {
      window.clearTimeout(superRewardCloseTimerRef.current)
      superRewardCloseTimerRef.current = null
    }
  }

  function clearActiveLocalRewardUrl() {
    if (!activeLocalRewardUrlRef.current) {
      return
    }

    URL.revokeObjectURL(activeLocalRewardUrlRef.current)
    activeLocalRewardUrlRef.current = null
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

  const speakSelectedLetter = useCallback(
    (letter: string) => {
      if (typeof window === 'undefined') {
        return
      }

      const synth = window.speechSynthesis
      if (!synth) {
        return
      }

      stopSpeech()
      const spokenLetter = letter.toLowerCase()
      const utterance = new SpeechSynthesisUtterance(spokenLetter)
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
      clearAnswerRevealTimer()
      clearSpeechTimer()
      clearSuperRewardCloseTimer()
      clearActiveLocalRewardUrl()
      stopSpeech()
    }
  }, [stopSpeech])

  useEffect(() => {
    clearAnswerRevealTimer()
    if (answerRevealDelayMs <= 0) {
      setAreAnswersVisible(true)
      setAnimateAnswerReveal(false)
      return
    }

    setAreAnswersVisible(false)
    setAnimateAnswerReveal(false)
    answerRevealTimerRef.current = window.setTimeout(() => {
      answerRevealTimerRef.current = null
      setAreAnswersVisible(true)
      setAnimateAnswerReveal(true)
    }, answerRevealDelayMs)

    return () => {
      clearAnswerRevealTimer()
    }
  }, [answerRevealDelayMs, round.roundIndex, roundIndex])

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
    superRewardLaunchTokenRef.current += 1
    clearSuperRewardCloseTimer()
    clearActiveLocalRewardUrl()
    setRoundIndex(nextIndex)
    setRound(createRound(nextIndex, getStoredLetterListeningAllowedLetters()))
    setFeedback('idle')
    setConfettiParticles([])
    setIsLocked(false)
    setShowAnswerPointer(false)
    setSelectedLetter(null)
    setWrongLetters([])
    setActiveSuperRewardPlayback(null)
  }

  async function launchSuperRewardVideo() {
    if (playableSuperRewardVideos.length === 0) {
      moveToNextRound()
      return
    }

    const launchToken = superRewardLaunchTokenRef.current + 1
    superRewardLaunchTokenRef.current = launchToken
    const chosenIndex = randomIntInclusive(0, playableSuperRewardVideos.length - 1)
    const chosenVideo = playableSuperRewardVideos[chosenIndex]

    clearSuperRewardCloseTimer()
    try {
      if (chosenVideo.source === 'youtube') {
        clearActiveLocalRewardUrl()
        setActiveSuperRewardPlayback({
          kind: 'youtube',
          embedUrl: chosenVideo.embedUrl,
          iframeKey: `reward-${round.roundIndex}-${Date.now()}`,
        })
      } else {
        const storedBlob = await getStoredLocalRewardVideoBlob(chosenVideo.localVideoId)
        if (!storedBlob) {
          if (superRewardLaunchTokenRef.current === launchToken) {
            moveToNextRound()
          }
          return
        }

        const objectUrl = URL.createObjectURL(storedBlob)
        if (superRewardLaunchTokenRef.current !== launchToken) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        clearActiveLocalRewardUrl()
        activeLocalRewardUrlRef.current = objectUrl
        setActiveSuperRewardPlayback({
          kind: 'local',
          videoKey: `reward-${round.roundIndex}-${Date.now()}`,
          videoUrl: objectUrl,
          startSeconds: chosenVideo.startSeconds,
        })
      }

      superRewardCloseTimerRef.current = window.setTimeout(() => {
        closeSuperRewardVideo()
      }, chosenVideo.durationMs)
    } catch {
      if (superRewardLaunchTokenRef.current === launchToken) {
        moveToNextRound()
      }
    }
  }

  function closeSuperRewardVideo() {
    superRewardLaunchTokenRef.current += 1
    clearSuperRewardCloseTimer()
    clearActiveLocalRewardUrl()
    setActiveSuperRewardPlayback(null)
    moveToNextRound()
  }

  function handleAnswer(letter: string) {
    if (isLocked) {
      return
    }

    clearSpeechTimer()
    speakSelectedLetter(letter)

    if (isCorrectAnswer(round, letter)) {
      const isFirstTryCorrect = wrongLetters.length === 0
      const nextFirstTryCorrectStreak = isFirstTryCorrect ? firstTryCorrectStreak + 1 : 0
      const shouldOfferSuperReward =
        superRewardEnabled &&
        isFirstTryCorrect &&
        playableSuperRewardVideos.length > 0 &&
        nextFirstTryCorrectStreak >= superRewardFirstTryStreakTarget
      setSelectedLetter(letter)
      setIsLocked(true)
      setShowAnswerPointer(false)
      clearActiveTimer()
      clearAnswerPointerTimer()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setFeedback('correct')
        setConfettiParticles(createConfettiParticles(400))
        playSuccessJingle()
        speakBravo()
        if (shouldOfferSuperReward) {
          setFirstTryCorrectStreak(0)
          void launchSuperRewardVideo()
          return
        }
        setFirstTryCorrectStreak(nextFirstTryCorrectStreak)
      }, SUCCESS_SEQUENCE_DELAY_MS)
      return
    }

    setWrongLetters((current) => (current.includes(letter) ? current : [...current, letter]))
    setFirstTryCorrectStreak(0)
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
    speakBravo()
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      moveToNextRound()
    }, COLORING_REWARD_RESULT_VISIBLE_MS)
  }

  const promptToneStyle = useMemo<CSSProperties>(() => {
    const alphabetIndex = round.targetLetter.charCodeAt(0) - 'A'.charCodeAt(0)
    const tone = LETTER_PROMPT_TONES[Math.abs(alphabetIndex) % LETTER_PROMPT_TONES.length]

    return {
      '--prompt-pastel-start': tone.start,
      '--prompt-pastel-middle': tone.middle,
      '--prompt-pastel-end': tone.end,
    } as CSSProperties
  }, [round.targetLetter])
  const shouldShowColoringReward =
    feedback === 'correct' && activeSuperRewardPlayback === null

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

      <section
        className={`prompt-card ${feedback === 'correct' ? 'is-flash' : ''}`}
        aria-live="polite"
        style={promptToneStyle}
      >
        <p className="prompt-label">
          {shouldShowColoringReward ? text.coloringInstructionLabel : text.instructionLabel}
        </p>
        {shouldShowColoringReward ? (
          <GlyphColoringReward
            glyph={round.targetLetter}
            instructionLabel={text.coloringInstructionLabel}
            onComplete={handleColoringCompleted}
          />
        ) : feedback !== 'correct' ? (
          <button
            type="button"
            className="play-letter-button"
            onClick={() => speakLetter(round.targetLetter)}
            aria-label={text.replayLabel}
            title={text.replayLabel}
          >
            ▶
          </button>
        ) : null}
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
        <div className={`answer-grid ${animateAnswerReveal ? 'is-revealing' : ''}`}>
          {round.options.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`answer-button ${!areAnswersVisible ? 'is-pre-reveal' : ''} ${
                selectedLetter === letter && letter === round.targetLetter ? 'is-selected-correct' : ''
              } ${
                wrongLetters.includes(letter) ? 'is-selected-wrong' : ''
              } ${
                feedback === 'correct' && letter === round.targetLetter ? 'is-correct-answer' : ''
              } ${feedback !== 'correct' && showAnswerPointer && areAnswersVisible && letter === round.targetLetter ? 'is-pointer-target' : ''}`}
              onClick={() => handleAnswer(letter)}
              disabled={isLocked || !areAnswersVisible}
            >
              <span className="answer-letter">{letter}</span>
              {feedback !== 'correct' && showAnswerPointer && areAnswersVisible && letter === round.targetLetter ? (
                <span className="answer-pointer" aria-hidden="true">
                  👉
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <SuperRewardVideoModal
        playback={activeSuperRewardPlayback}
        title={superRewardText.modalTitle}
        closeLabel={superRewardText.closeLabel}
        onClose={closeSuperRewardVideo}
      />
    </main>
  )
}

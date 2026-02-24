import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  letterListeningGameNameByLanguage,
  letterListeningGameTextByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
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

const NEXT_ROUND_DELAY_MS = 1200
const CONFETTI_COLORS = ['#ff6f91', '#ffd166', '#7ed957', '#66d9ff', '#c084ff']
const LETTER_PROMPT_TONES = [
  { start: '#ffe8ef', middle: '#fff4d9', end: '#dff7f6' },
  { start: '#fff0df', middle: '#fff8d6', end: '#e8f8db' },
  { start: '#e8f8db', middle: '#dff7f6', end: '#e5efff' },
  { start: '#dff7f6', middle: '#e5efff', end: '#ebe8ff' },
  { start: '#e5efff', middle: '#ebe8ff', end: '#f9e4ff' },
  { start: '#f9e4ff', middle: '#ffe8ef', end: '#fff0df' },
] as const

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

export function LetterListeningGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const text = letterListeningGameTextByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0))
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

      const spokenText =
        language === 'fr' ? `La lettre: ${letter}` : `The letter: ${letter}`

      stopSpeech()
      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US'
      utterance.rate = 0.75
      utterance.pitch = 1.05
      synth.speak(utterance)
    },
    [language, stopSpeech],
  )

  useEffect(() => {
    speakLetter(round.targetLetter)
    return () => {
      stopSpeech()
    }
  }, [round.targetLetter, speakLetter, stopSpeech])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      stopSpeech()
    }
  }, [stopSpeech])

  function moveToNextRound() {
    if (roundIndex + 1 >= TOTAL_ROUNDS) {
      setRoundIndex(TOTAL_ROUNDS)
      setIsLocked(false)
      return
    }

    const nextIndex = roundIndex + 1
    setRoundIndex(nextIndex)
    setRound(createRound(nextIndex))
    setFeedback('idle')
    setIsLocked(false)
  }

  function handleAnswer(letter: string) {
    if (isLocked || roundIndex >= TOTAL_ROUNDS) {
      return
    }

    if (isCorrectAnswer(round, letter)) {
      setConfettiParticles(createConfettiParticles(16))
      setFeedback('correct')
      setScore((current) => current + 1)
      setIsLocked(true)
      clearActiveTimer()
      playSuccessJingle()
      triggerLightVibration()

      timerRef.current = window.setTimeout(() => {
        moveToNextRound()
      }, NEXT_ROUND_DELAY_MS)
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
    stopSpeech()
    setRoundIndex(0)
    setRound(createRound(0))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
    setConfettiParticles([])
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
          <section
            className={`prompt-card ${feedback === 'correct' ? 'is-flash' : ''}`}
            aria-live="polite"
            style={promptToneStyle}
          >
            <p className="prompt-label">{text.instructionLabel}</p>
            <button
              type="button"
              className="play-letter-button"
              onClick={() => speakLetter(round.targetLetter)}
              aria-label={text.replayLabel}
              title={text.replayLabel}
            >
              ▶
            </button>
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
                  }`}
                  onClick={() => handleAnswer(letter)}
                  disabled={isLocked}
                >
                  {letter}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

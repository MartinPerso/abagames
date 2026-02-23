import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  countingGameNameByLanguage,
  countingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import { playRewardSfx } from '../../../shared/audio/sfx'
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

const cardClassByItem: Record<CountingItem, string> = {
  fireTruck: 'item-card item-fire',
  policeCar: 'item-card item-police',
  ambulance: 'item-card item-ambulance',
  boat: 'item-card item-boat',
  plane: 'item-card item-plane',
}

const imageByItem: Record<CountingItem, string> = {
  fireTruck: '/assets/illustrations/fireTruck.svg',
  policeCar: '/assets/illustrations/policeCar.svg',
  ambulance: '/assets/illustrations/ambulance.svg',
  boat: '/assets/illustrations/boat.svg',
  plane: '/assets/illustrations/plane.svg',
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
  const [soundEnabled, setSoundEnabled] = useState(true)
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
      if (soundEnabled) {
        playRewardSfx(round.item)
      }

      timerRef.current = window.setTimeout(() => {
        moveToNextRound()
      }, 3000)
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
  const cards = Array.from({ length: round.count }, (_, index) => (
    <div
      key={`${round.roundIndex}-${round.item}-${index}`}
      className={`${cardClassByItem[round.item]} ${feedback === 'correct' ? 'is-celebrating' : ''}`}
      aria-label={itemLabels[round.item]}
    >
      <img src={imageByItem[round.item]} alt="" className="item-image" />
    </div>
  ))

  return (
    <main className="app-shell counting-page">
      <header className="counting-header">
        <h1>{countingGameNameByLanguage[language]}</h1>
        <div className="header-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => setSoundEnabled((current) => !current)}
            aria-label={soundEnabled ? text.soundOn : text.soundOff}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
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
            <section className="status-row" aria-live="polite">
              <p>{`${roundIndex + 1}/${TOTAL_ROUNDS}`}</p>
              <p>⭐ {score}</p>
            </section>

            <section className="counting-stage" aria-label={itemLabels[round.item]}>
              <div className="item-grid">{cards}</div>
            </section>

            <p className={`feedback ${feedback}`}>{feedback === 'wrong' ? '❌' : ''}</p>
          </div>

          <section className="answers" aria-label={text.answerLabel}>
            <div className="answer-grid">
              {answerOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  className="answer-button"
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

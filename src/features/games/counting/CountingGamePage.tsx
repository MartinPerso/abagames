import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  countingGameTextByLanguage,
  itemLabelByLanguage,
  parseLanguageParam,
} from '../../../shared/i18n/i18n'
import { playRewardSfx } from '../../../shared/audio/sfx'
import {
  type CountingItem,
  ANSWER_OPTIONS,
  TOTAL_ROUNDS,
  createRound,
  isCorrectAnswer,
} from './gameLogic'
import './CountingGamePage.css'

type FeedbackState = 'idle' | 'correct' | 'wrong'

const cardClassByItem: Record<CountingItem, string> = {
  fireTruck: 'item-card item-fire',
  policeCar: 'item-card item-police',
  ambulance: 'item-card item-ambulance',
  boat: 'item-card item-boat',
  plane: 'item-card item-plane',
}

export function CountingGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const text = countingGameTextByLanguage[language]
  const itemLabels = itemLabelByLanguage[language]

  const [roundIndex, setRoundIndex] = useState(0)
  const [round, setRound] = useState(() => createRound(0))
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
    setRound(createRound(nextIndex))
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
      }, 1100)
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
    setRound(createRound(0))
    setScore(0)
    setFeedback('idle')
    setIsLocked(false)
  }

  const finished = roundIndex >= TOTAL_ROUNDS
  const cards = Array.from({ length: round.count }, (_, index) => (
    <div
      key={`${round.roundIndex}-${round.item}-${index}`}
      className={`${cardClassByItem[round.item]} ${feedback === 'correct' ? 'is-celebrating' : ''}`}
      aria-hidden="true"
    >
      {itemLabels[round.item]}
    </div>
  ))

  return (
    <main className="app-shell counting-page">
      <header className="counting-header">
        <div>
          <h1>{text.title}</h1>
          <p>{text.instruction}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => setSoundEnabled((current) => !current)}
          >
            {soundEnabled ? text.soundOn : text.soundOff}
          </button>
          <Link to={`/?lang=${language}`} className="secondary-link">
            {text.backHome}
          </Link>
        </div>
      </header>

      {finished ? (
        <section className="result-card" aria-live="polite">
          <h2>{text.finishTitle}</h2>
          <p>{text.finishSummary(score, TOTAL_ROUNDS)}</p>
          <div className="result-actions">
            <button type="button" className="answer-button" onClick={restartGame}>
              {text.replay}
            </button>
            <Link to={`/?lang=${language}`} className="secondary-link">
              {text.backHome}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="status-row" aria-live="polite">
            <p>
              {text.progressLabel} {roundIndex + 1} / {TOTAL_ROUNDS}
            </p>
            <p>
              {text.scoreLabel}: {score}
            </p>
          </section>

          <section className="counting-stage" aria-label={itemLabels[round.item]}>
            <div className="item-grid">{cards}</div>
          </section>

          <section className="answers" aria-label={text.answerLabel}>
            <p>{text.answerLabel}</p>
            <div className="answer-grid">
              {ANSWER_OPTIONS.map((value) => (
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
          <p className={`feedback ${feedback}`}>{feedback === 'correct' ? text.correctFeedback : ''}</p>
          <p className={`feedback ${feedback}`}>{feedback === 'wrong' ? text.wrongFeedback : ''}</p>
        </>
      )}
    </main>
  )
}

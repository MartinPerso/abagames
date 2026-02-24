import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  countingGameNameByLanguage,
  inverseCountingGameNameByLanguage,
  letterListeningGameNameByLanguage,
  type Language,
  languageLabels,
  parseLanguageParam,
  setStoredLanguage,
  settingsTextByLanguage,
} from '../../shared/i18n/i18n'
import {
  ALL_ALPHABET_LETTERS,
  COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS,
  answerPointerDelaySettingsRange,
  countingHintFirstDelaySettingsRange,
  countingHintRepeatDelaySettingsRange,
  countingSettingsRange,
  getStoredCountingAnswerPointerDelaySeconds,
  getStoredCountingAnswerPointerEnabled,
  getStoredCountingHintFirstDelaySeconds,
  getStoredCountingHintRepeatDelaySeconds,
  getStoredCountingMaxObjects,
  getStoredLetterListeningAnswerPointerDelaySeconds,
  getStoredLetterListeningAnswerPointerEnabled,
  getStoredLetterListeningAllowedLettersForSettings,
  getStoredReverseCountingAnswerPointerDelaySeconds,
  getStoredReverseCountingAnswerPointerEnabled,
  getStoredReverseCountingMaxObjects,
  reverseCountingSettingsRange,
  setStoredCountingAnswerPointerDelaySeconds,
  setStoredCountingAnswerPointerEnabled,
  setStoredCountingHintFirstDelaySeconds,
  setStoredCountingHintRepeatDelaySeconds,
  setStoredCountingMaxObjects,
  setStoredLetterListeningAnswerPointerDelaySeconds,
  setStoredLetterListeningAnswerPointerEnabled,
  setStoredLetterListeningAllowedLetters,
  setStoredReverseCountingAnswerPointerDelaySeconds,
  setStoredReverseCountingAnswerPointerEnabled,
  setStoredReverseCountingMaxObjects,
} from '../../shared/settings/gameSettings'
import './SettingsPage.css'

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const [language, setLanguage] = useState<Language>(() =>
    parseLanguageParam(searchParams.get('lang')),
  )
  const [countingMaxObjects, setCountingMaxObjects] = useState<number>(() =>
    getStoredCountingMaxObjects(),
  )
  const [countingAnswerPointerEnabled, setCountingAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredCountingAnswerPointerEnabled(),
  )
  const [countingAnswerPointerDelaySeconds, setCountingAnswerPointerDelaySeconds] =
    useState<number>(() => getStoredCountingAnswerPointerDelaySeconds())
  const [countingHintFirstDelaySeconds, setCountingHintFirstDelaySeconds] = useState<number>(() =>
    getStoredCountingHintFirstDelaySeconds(),
  )
  const [countingHintRepeatDelaySeconds, setCountingHintRepeatDelaySeconds] = useState<number>(() =>
    getStoredCountingHintRepeatDelaySeconds(),
  )
  const [reverseCountingMaxObjects, setReverseCountingMaxObjects] = useState<number>(() =>
    getStoredReverseCountingMaxObjects(),
  )
  const [reverseAnswerPointerEnabled, setReverseAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredReverseCountingAnswerPointerEnabled(),
  )
  const [reverseAnswerPointerDelaySeconds, setReverseAnswerPointerDelaySeconds] = useState<number>(
    () => getStoredReverseCountingAnswerPointerDelaySeconds(),
  )
  const [letterAnswerPointerEnabled, setLetterAnswerPointerEnabled] = useState<boolean>(() =>
    getStoredLetterListeningAnswerPointerEnabled(),
  )
  const [letterAnswerPointerDelaySeconds, setLetterAnswerPointerDelaySeconds] = useState<number>(
    () => getStoredLetterListeningAnswerPointerDelaySeconds(),
  )
  const [letterListeningLetters, setLetterListeningLetters] = useState<Set<string>>(
    () => new Set(getStoredLetterListeningAllowedLettersForSettings()),
  )
  const text = settingsTextByLanguage[language]
  const isCountingHintDisabled =
    countingHintFirstDelaySeconds === COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS

  useEffect(() => {
    const fromQuery = parseLanguageParam(searchParams.get('lang'))
    setLanguage(fromQuery)
  }, [searchParams])

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
  }

  function handleCountingMaxObjectsChange(nextValue: number) {
    setCountingMaxObjects(nextValue)
    setStoredCountingMaxObjects(nextValue)
  }

  function handleCountingAnswerPointerEnabledChange(enabled: boolean) {
    setCountingAnswerPointerEnabled(enabled)
    setStoredCountingAnswerPointerEnabled(enabled)
  }

  function handleCountingAnswerPointerDelayChange(nextValue: number) {
    setCountingAnswerPointerDelaySeconds(nextValue)
    setStoredCountingAnswerPointerDelaySeconds(nextValue)
  }

  function handleCountingHintFirstDelayChange(nextValue: number) {
    setCountingHintFirstDelaySeconds(nextValue)
    setStoredCountingHintFirstDelaySeconds(nextValue)
  }

  function handleCountingHintRepeatDelayChange(nextValue: number) {
    setCountingHintRepeatDelaySeconds(nextValue)
    setStoredCountingHintRepeatDelaySeconds(nextValue)
  }

  function handleReverseCountingMaxObjectsChange(nextValue: number) {
    setReverseCountingMaxObjects(nextValue)
    setStoredReverseCountingMaxObjects(nextValue)
  }

  function handleReverseAnswerPointerEnabledChange(enabled: boolean) {
    setReverseAnswerPointerEnabled(enabled)
    setStoredReverseCountingAnswerPointerEnabled(enabled)
  }

  function handleReverseAnswerPointerDelayChange(nextValue: number) {
    setReverseAnswerPointerDelaySeconds(nextValue)
    setStoredReverseCountingAnswerPointerDelaySeconds(nextValue)
  }

  function handleLetterAnswerPointerEnabledChange(enabled: boolean) {
    setLetterAnswerPointerEnabled(enabled)
    setStoredLetterListeningAnswerPointerEnabled(enabled)
  }

  function handleLetterAnswerPointerDelayChange(nextValue: number) {
    setLetterAnswerPointerDelaySeconds(nextValue)
    setStoredLetterListeningAnswerPointerDelaySeconds(nextValue)
  }

  function handleLetterListeningLetterToggle(letter: string) {
    const next = new Set(letterListeningLetters)
    if (next.has(letter)) {
      next.delete(letter)
    } else {
      next.add(letter)
    }
    setLetterListeningLetters(next)
    setStoredLetterListeningAllowedLetters([...next])
  }

  function handleLetterListeningSelectAll() {
    setLetterListeningLetters(new Set(ALL_ALPHABET_LETTERS))
    setStoredLetterListeningAllowedLetters([...ALL_ALPHABET_LETTERS])
  }

  function handleLetterListeningDeselectAll() {
    setLetterListeningLetters(new Set())
    setStoredLetterListeningAllowedLetters([])
  }

  return (
    <main className="app-shell settings-page">
      <header className="settings-header">
        <h1>{text.title}</h1>
        <Link to={`/?lang=${language}`} className="secondary-link" aria-label={text.backHomeLabel}>
          ⌂
        </Link>
      </header>

      <section className="settings-card">
        <h2>{text.languageTitle}</h2>
        <div className="language-switcher" role="group" aria-label={text.languageTitle}>
          {(['fr', 'en'] as const).map((lang) => {
            const active = language === lang
            return (
              <button
                key={lang}
                type="button"
                className={`language-chip ${active ? 'is-active' : ''}`}
                onClick={() => handleLanguageChange(lang)}
              >
                {languageLabels[lang]}
              </button>
            )
          })}
        </div>
      </section>

      <section className="settings-card">
        <h2>{countingGameNameByLanguage[language]}</h2>
        <label className="field-label" htmlFor="counting-max-objects">
          {text.countingMaxObjectsLabel}
        </label>
        <div className="range-row">
          <input
            id="counting-max-objects"
            type="range"
            min={countingSettingsRange.min}
            max={countingSettingsRange.max}
            value={countingMaxObjects}
            onChange={(event) => handleCountingMaxObjectsChange(Number(event.target.value))}
          />
          <output htmlFor="counting-max-objects">{countingMaxObjects}</output>
        </div>

        <label className="field-label" htmlFor="counting-hint-first-delay">
          {text.countingHintFirstDelayLabel}
        </label>
        <div className="range-row">
          <input
            id="counting-hint-first-delay"
            type="range"
            min={countingHintFirstDelaySettingsRange.min}
            max={countingHintFirstDelaySettingsRange.max}
            value={countingHintFirstDelaySeconds}
            onChange={(event) => handleCountingHintFirstDelayChange(Number(event.target.value))}
          />
          <output htmlFor="counting-hint-first-delay">
            {isCountingHintDisabled ? text.countingHintNeverLabel : `${countingHintFirstDelaySeconds}s`}
          </output>
        </div>

        <label className="field-label" htmlFor="counting-hint-repeat-delay">
          {text.countingHintRepeatDelayLabel}
        </label>
        <div className={`range-row ${isCountingHintDisabled ? 'is-disabled' : ''}`}>
          <input
            id="counting-hint-repeat-delay"
            type="range"
            min={countingHintRepeatDelaySettingsRange.min}
            max={countingHintRepeatDelaySettingsRange.max}
            value={countingHintRepeatDelaySeconds}
            onChange={(event) => handleCountingHintRepeatDelayChange(Number(event.target.value))}
            disabled={isCountingHintDisabled}
          />
          <output htmlFor="counting-hint-repeat-delay">{countingHintRepeatDelaySeconds}s</output>
        </div>

        <label className="toggle-row" htmlFor="counting-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="counting-answer-pointer-enabled"
            type="checkbox"
            checked={countingAnswerPointerEnabled}
            onChange={(event) => handleCountingAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="field-label" htmlFor="counting-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!countingAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="counting-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={countingAnswerPointerDelaySeconds}
            onChange={(event) => handleCountingAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!countingAnswerPointerEnabled}
          />
          <output htmlFor="counting-answer-pointer-delay">
            {countingAnswerPointerDelaySeconds}s
          </output>
        </div>
      </section>

      <section className="settings-card">
        <h2>{inverseCountingGameNameByLanguage[language]}</h2>
        <label className="field-label" htmlFor="reverse-counting-max-objects">
          {text.reverseCountingMaxObjectsLabel}
        </label>
        <div className="range-row">
          <input
            id="reverse-counting-max-objects"
            type="range"
            min={reverseCountingSettingsRange.min}
            max={reverseCountingSettingsRange.max}
            value={reverseCountingMaxObjects}
            onChange={(event) => handleReverseCountingMaxObjectsChange(Number(event.target.value))}
          />
          <output htmlFor="reverse-counting-max-objects">{reverseCountingMaxObjects}</output>
        </div>

        <label className="toggle-row" htmlFor="reverse-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="reverse-answer-pointer-enabled"
            type="checkbox"
            checked={reverseAnswerPointerEnabled}
            onChange={(event) => handleReverseAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="field-label" htmlFor="reverse-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!reverseAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="reverse-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={reverseAnswerPointerDelaySeconds}
            onChange={(event) => handleReverseAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!reverseAnswerPointerEnabled}
          />
          <output htmlFor="reverse-answer-pointer-delay">{reverseAnswerPointerDelaySeconds}s</output>
        </div>
      </section>

      <section className="settings-card">
        <h2>{letterListeningGameNameByLanguage[language]}</h2>
        <label className="field-label">{text.letterListeningAllowedLettersLabel}</label>
        <p className="settings-hint">{text.letterListeningMinLettersHint}</p>
        <div className="letter-selection-actions">
          <button
            type="button"
            className="language-chip"
            onClick={handleLetterListeningSelectAll}
          >
            {text.letterListeningAllLetters}
          </button>
          <button
            type="button"
            className="language-chip"
            onClick={handleLetterListeningDeselectAll}
          >
            {text.letterListeningNoLetters}
          </button>
        </div>
        <div className="letter-selection-grid" role="group" aria-label={text.letterListeningAllowedLettersLabel}>
          {ALL_ALPHABET_LETTERS.map((letter) => {
            const isSelected = letterListeningLetters.has(letter)
            return (
              <button
                key={letter}
                type="button"
                className={`letter-chip ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleLetterListeningLetterToggle(letter)}
                aria-pressed={isSelected}
                aria-label={letter}
              >
                {letter}
              </button>
            )
          })}
        </div>

        <label className="toggle-row" htmlFor="letter-answer-pointer-enabled">
          <span>{text.answerPointerEnabledLabel}</span>
          <input
            id="letter-answer-pointer-enabled"
            type="checkbox"
            checked={letterAnswerPointerEnabled}
            onChange={(event) => handleLetterAnswerPointerEnabledChange(event.target.checked)}
          />
        </label>

        <label className="field-label" htmlFor="letter-answer-pointer-delay">
          {text.answerPointerDelayLabel}
        </label>
        <div className={`range-row ${!letterAnswerPointerEnabled ? 'is-disabled' : ''}`}>
          <input
            id="letter-answer-pointer-delay"
            type="range"
            min={answerPointerDelaySettingsRange.min}
            max={answerPointerDelaySettingsRange.max}
            value={letterAnswerPointerDelaySeconds}
            onChange={(event) => handleLetterAnswerPointerDelayChange(Number(event.target.value))}
            disabled={!letterAnswerPointerEnabled}
          />
          <output htmlFor="letter-answer-pointer-delay">{letterAnswerPointerDelaySeconds}s</output>
        </div>
      </section>
    </main>
  )
}

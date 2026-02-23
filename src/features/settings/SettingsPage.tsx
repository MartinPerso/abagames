import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  countingGameNameByLanguage,
  type Language,
  languageLabels,
  parseLanguageParam,
  setStoredLanguage,
  settingsTextByLanguage,
} from '../../shared/i18n/i18n'
import {
  countingSettingsRange,
  getStoredCountingMaxObjects,
  setStoredCountingMaxObjects,
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
  const text = settingsTextByLanguage[language]

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
      </section>
    </main>
  )
}

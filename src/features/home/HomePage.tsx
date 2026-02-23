import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  type Language,
  homeTextByLanguage,
  languageLabels,
  parseLanguageParam,
  setStoredLanguage,
} from '../../shared/i18n/i18n'
import './HomePage.css'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const [language, setLanguage] = useState<Language>(() =>
    parseLanguageParam(searchParams.get('lang')),
  )
  const text = homeTextByLanguage[language]

  useEffect(() => {
    const fromQuery = parseLanguageParam(searchParams.get('lang'))
    setLanguage(fromQuery)
    setStoredLanguage(fromQuery)
  }, [searchParams])

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
  }

  return (
    <main className="app-shell home-page">
      <header className="home-header">
        <div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
        <div className="language-switcher" role="group" aria-label={text.languageAriaLabel}>
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
      </header>

      <section className="game-grid" aria-label={text.availableGames}>
        <article className="game-card">
          <span className="badge">{text.levelBadge}</span>
          <h2>{text.countingCardTitle}</h2>
          <p>{text.countingCardDescription}</p>
          <Link to={`/games/counting?lang=${language}`} className="primary-button">
            {text.play}
          </Link>
        </article>
      </section>
    </main>
  )
}

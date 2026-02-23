import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  countingGameNameByLanguage,
  homeTextByLanguage,
  parseLanguageParam,
  setStoredLanguage,
} from '../../shared/i18n/i18n'
import './HomePage.css'

export function HomePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))
  const text = homeTextByLanguage[language]

  useEffect(() => {
    setStoredLanguage(language)
  }, [language])

  return (
    <main className="app-shell home-page">
      <header className="home-header">
        <h1>{text.title}</h1>
        <Link
          to={`/settings?lang=${language}`}
          className="settings-link"
          aria-label={text.settingsLabel}
          title={text.settingsLabel}
        >
          ⚙
        </Link>
      </header>

      <section className="game-grid" aria-label={text.availableGames}>
        <article className="game-card">
          <h2>{countingGameNameByLanguage[language]}</h2>
          <div className="home-illustrations" aria-hidden="true">
            <img src="/assets/illustrations/fireTruck.svg" alt="" />
            <img src="/assets/illustrations/boat.svg" alt="" />
            <img src="/assets/illustrations/plane.svg" alt="" />
          </div>
          <Link to={`/games/counting?lang=${language}`} className="primary-button">
            ▶
          </Link>
        </article>
      </section>
    </main>
  )
}

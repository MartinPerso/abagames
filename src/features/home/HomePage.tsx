import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  countingGameNameByLanguage,
  homeTextByLanguage,
  inverseCountingGameNameByLanguage,
  letterListeningGameNameByLanguage,
  parseLanguageParam,
  setStoredLanguage,
} from '../../shared/i18n/i18n'
import './HomePage.css'

const assetsBaseUrl = `${import.meta.env.BASE_URL}assets/illustrations`

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
        <article className="game-card game-card-number">
          <div className="game-card-head">
            <h2 className="game-title">{countingGameNameByLanguage[language]}</h2>
            <p className="game-pictogram" aria-hidden="true">
              123
            </p>
          </div>
          <div className="game-card-body">
            <img
              src={`${assetsBaseUrl}/plane.svg`}
              alt=""
              className="home-illustration"
              aria-hidden="true"
            />
            <Link
              to={`/games/counting?lang=${language}`}
              className="primary-button"
              aria-label={countingGameNameByLanguage[language]}
            >
              <span aria-hidden="true">▶</span>
            </Link>
          </div>
        </article>

        <article className="game-card game-card-quantity">
          <div className="game-card-head">
            <h2 className="game-title">{inverseCountingGameNameByLanguage[language]}</h2>
            <p className="game-pictogram" aria-hidden="true">
              ●●●
            </p>
          </div>
          <div className="game-card-body">
            <img
              src={`${assetsBaseUrl}/ambulance.svg`}
              alt=""
              className="home-illustration"
              aria-hidden="true"
            />
            <Link
              to={`/games/reverse-counting?lang=${language}`}
              className="primary-button"
              aria-label={inverseCountingGameNameByLanguage[language]}
            >
              <span aria-hidden="true">▶</span>
            </Link>
          </div>
        </article>

        <article className="game-card game-card-letter">
          <div className="game-card-head">
            <h2 className="game-title">{letterListeningGameNameByLanguage[language]}</h2>
            <p className="game-pictogram" aria-hidden="true">
              A B C
            </p>
          </div>
          <div className="game-card-body">
            <img
              src={`${assetsBaseUrl}/earListening.svg`}
              alt=""
              className="home-illustration"
              aria-hidden="true"
            />
            <Link
              to={`/games/letter-listening?lang=${language}`}
              className="primary-button"
              aria-label={letterListeningGameNameByLanguage[language]}
            >
              <span aria-hidden="true">▶</span>
            </Link>
          </div>
        </article>
      </section>

      <footer className="home-footer" aria-label={text.aboutTitle}>
        <p className="home-disclaimer">{text.aboutText}</p>
      </footer>
    </main>
  )
}

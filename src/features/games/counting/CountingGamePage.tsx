import { Link, useSearchParams } from 'react-router-dom'
import { parseLanguageParam } from '../../../shared/i18n/i18n'

export function CountingGamePage() {
  const [searchParams] = useSearchParams()
  const language = parseLanguageParam(searchParams.get('lang'))

  return (
    <main className="app-shell">
      <h1>Counting game</h1>
      <p>{language === 'fr' ? 'Le jeu arrive a la prochaine etape.' : 'Game coming next step.'}</p>
      <Link to="/" className="secondary-link">
        {language === 'fr' ? "Retour a l'accueil" : 'Back to home'}
      </Link>
    </main>
  )
}

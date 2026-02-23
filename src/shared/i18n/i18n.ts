export type Language = 'fr' | 'en'

const LANGUAGE_STORAGE_KEY = 'abagames-language'

export const languageLabels: Record<Language, string> = {
  fr: 'FR',
  en: 'EN',
}

type HomeText = {
  title: string
  subtitle: string
  availableGames: string
  countingCardTitle: string
  countingCardDescription: string
  levelBadge: string
  play: string
  languageAriaLabel: string
}

export const homeTextByLanguage: Record<Language, HomeText> = {
  fr: {
    title: 'ABA Games',
    subtitle: 'Jeux courts et ludiques pour apprendre en douceur.',
    availableGames: 'Jeux disponibles',
    countingCardTitle: 'Compter les vehicules',
    countingCardDescription:
      "Observe les elements a l'ecran, puis touche le bon chiffre entre 1 et 5.",
    levelBadge: 'Niveau 1',
    play: 'Jouer',
    languageAriaLabel: 'Choix de langue',
  },
  en: {
    title: 'ABA Games',
    subtitle: 'Short, playful games for early learning.',
    availableGames: 'Available games',
    countingCardTitle: 'Count the vehicles',
    countingCardDescription: 'Look at the items, then tap the correct number from 1 to 5.',
    levelBadge: 'Level 1',
    play: 'Play',
    languageAriaLabel: 'Language picker',
  },
}

function languageFromNavigator(): Language {
  if (typeof navigator === 'undefined') {
    return 'fr'
  }

  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'fr'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') {
    return stored
  }

  return languageFromNavigator()
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export function parseLanguageParam(candidate: string | null): Language {
  if (candidate === 'fr' || candidate === 'en') {
    return candidate
  }

  return getStoredLanguage()
}

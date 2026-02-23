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

type CountingGameText = {
  title: string
  instruction: string
  progressLabel: string
  scoreLabel: string
  answerLabel: string
  correctFeedback: string
  wrongFeedback: string
  finishTitle: string
  finishSummary: (score: number, total: number) => string
  replay: string
  backHome: string
}

export const countingGameTextByLanguage: Record<Language, CountingGameText> = {
  fr: {
    title: 'Combien y en a-t-il ?',
    instruction: 'Compte les objets puis touche le bon chiffre.',
    progressLabel: 'Essai',
    scoreLabel: 'Score',
    answerLabel: 'Choisis un chiffre de 1 a 5',
    correctFeedback: 'Bravo !',
    wrongFeedback: 'Presque. Reessaie calmement.',
    finishTitle: 'Session terminee',
    finishSummary: (score, total) => `Tu as trouve ${score} bonne${score > 1 ? 's' : ''} reponse${score > 1 ? 's' : ''} sur ${total}.`,
    replay: 'Rejouer',
    backHome: "Retour a l'accueil",
  },
  en: {
    title: 'How many are there?',
    instruction: 'Count the items and tap the correct number.',
    progressLabel: 'Trial',
    scoreLabel: 'Score',
    answerLabel: 'Choose a number from 1 to 5',
    correctFeedback: 'Great job!',
    wrongFeedback: 'Almost. Try again calmly.',
    finishTitle: 'Session complete',
    finishSummary: (score, total) => `You got ${score} correct answer${score > 1 ? 's' : ''} out of ${total}.`,
    replay: 'Play again',
    backHome: 'Back to home',
  },
}

export const itemLabelByLanguage: Record<Language, Record<string, string>> = {
  fr: {
    fireTruck: 'Voiture de pompier',
    policeCar: 'Voiture de police',
    ambulance: 'Ambulance',
    boat: 'Bateau',
    plane: 'Avion',
  },
  en: {
    fireTruck: 'Fire truck',
    policeCar: 'Police car',
    ambulance: 'Ambulance',
    boat: 'Boat',
    plane: 'Plane',
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

export type Language = 'fr' | 'en'

const LANGUAGE_STORAGE_KEY = 'abagames-language'

export const languageLabels: Record<Language, string> = {
  fr: 'FR',
  en: 'EN',
}

type HomeText = {
  title: string
  availableGames: string
  settingsLabel: string
  aboutTitle: string
  aboutText: string
}

export const homeTextByLanguage: Record<Language, HomeText> = {
  fr: {
    title: 'Jeux ABA',
    availableGames: 'Jeux disponibles',
    settingsLabel: 'Reglages',
    aboutTitle: 'Avertissement',
    aboutText:
      "Ce site a ete cree par le parent d'un enfant avec un trouble du spectre autistique, a partir de sa propre comprehension de l'ABA, avec des jeux concus pour son enfant. Si cela peut servir a d'autres familles, l'auteur s'en rejouit. Ce contenu ne remplace pas un accompagnement professionnel et n'a pas ete realise avec des professionnels.",
  },
  en: {
    title: 'ABA Games',
    availableGames: 'Available games',
    settingsLabel: 'Settings',
    aboutTitle: 'Disclaimer',
    aboutText:
      "This site was created by the parent of an autistic child, based on their own understanding of ABA, with games made for their child. If it helps other families, the author is glad. It does not replace professional support and was not created with professionals.",
  },
}

export const countingGameNameByLanguage: Record<Language, string> = {
  fr: 'Jeu du Nombre',
  en: 'Number Game',
}

export const inverseCountingGameNameByLanguage: Record<Language, string> = {
  fr: 'Jeu de la Quantité',
  en: 'Quantity Game',
}

export const letterListeningGameNameByLanguage: Record<Language, string> = {
  fr: 'Jeu des Lettres',
  en: 'Letter Game',
}

type CountingGameText = {
  answerLabel: string
  soundOn: string
  soundOff: string
  bravoAlert: string
}

export const countingGameTextByLanguage: Record<Language, CountingGameText> = {
  fr: {
    answerLabel: 'Choisis un chiffre',
    soundOn: 'Son active',
    soundOff: 'Son coupe',
    bravoAlert: 'Bravo',
  },
  en: {
    answerLabel: 'Choose a number',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    bravoAlert: 'Great',
  },
}

type InverseCountingGameText = {
  answerLabel: string
  bravoAlert: string
}

export const inverseCountingGameTextByLanguage: Record<Language, InverseCountingGameText> = {
  fr: {
    answerLabel: 'Trouve le bon groupe',
    bravoAlert: 'Bravo',
  },
  en: {
    answerLabel: 'Find the matching group',
    bravoAlert: 'Great',
  },
}

type LetterListeningGameText = {
  instructionLabel: string
  replayLabel: string
  answerLabel: string
  bravoAlert: string
}

export const letterListeningGameTextByLanguage: Record<Language, LetterListeningGameText> = {
  fr: {
    instructionLabel: 'Ecoute la lettre',
    replayLabel: 'Reecouter la lettre',
    answerLabel: 'Choisis la bonne lettre',
    bravoAlert: 'Bravo',
  },
  en: {
    instructionLabel: 'Listen to the letter',
    replayLabel: 'Play letter again',
    answerLabel: 'Choose the correct letter',
    bravoAlert: 'Great',
  },
}

type SettingsText = {
  title: string
  languageTitle: string
  countingMaxObjectsLabel: string
  reverseCountingMaxObjectsLabel: string
  backHomeLabel: string
}

export const settingsTextByLanguage: Record<Language, SettingsText> = {
  fr: {
    title: 'Reglages',
    languageTitle: 'Langue',
    countingMaxObjectsLabel: "Nombre d'objets maximum",
    reverseCountingMaxObjectsLabel: "Nombre d'objets maximum",
    backHomeLabel: 'Retour accueil',
  },
  en: {
    title: 'Settings',
    languageTitle: 'Language',
    countingMaxObjectsLabel: 'Maximum number of objects',
    reverseCountingMaxObjectsLabel: 'Maximum number of objects',
    backHomeLabel: 'Back home',
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

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'fr'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') {
    return stored
  }

  return 'fr'
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

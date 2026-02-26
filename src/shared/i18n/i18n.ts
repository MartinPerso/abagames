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
    settingsLabel: 'Réglages',
    aboutTitle: 'Avertissement',
    aboutText:
      "Ce site a été créé par le parent à partir de sa propre compréhension de l'ABA. Si cela peut servir à d'autres familles, l'auteur s'en réjouit. Ce contenu ne remplace pas un accompagnement professionnel et n'a pas été réalisé avec des professionnels.",
  },
  en: {
    title: 'ABA Games',
    availableGames: 'Available games',
    settingsLabel: 'Settings',
    aboutTitle: 'Disclaimer',
    aboutText:
      "This site was created by a parent based on their own understanding of ABA. If it helps other families, the author is glad. It does not replace professional support and was not created with professionals.",
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
    soundOn: 'Son activé',
    soundOff: 'Son coupé',
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
  speechPrefix: string
  replayLabel: string
}

export const inverseCountingGameTextByLanguage: Record<Language, InverseCountingGameText> = {
  fr: {
    answerLabel: 'Trouve le bon groupe',
    bravoAlert: 'Bravo',
    speechPrefix: 'Le chiffre ',
    replayLabel: 'Réécouter le chiffre',
  },
  en: {
    answerLabel: 'Find the matching group',
    bravoAlert: 'Great',
    speechPrefix: 'The number ',
    replayLabel: 'Play number again',
  },
}

type LetterListeningGameText = {
  instructionLabel: string
  replayLabel: string
  answerLabel: string
  coloringInstructionLabel: string
  bravoAlert: string
  speechPrefix: string
}

export const letterListeningGameTextByLanguage: Record<Language, LetterListeningGameText> = {
  fr: {
    instructionLabel: 'Écoute la lettre',
    replayLabel: 'Réécouter la lettre',
    answerLabel: 'Choisis la bonne lettre',
    coloringInstructionLabel: 'Colorie la lettre avec ton doigt',
    bravoAlert: 'Bravo',
    speechPrefix: 'La lettre : ',
  },
  en: {
    instructionLabel: 'Listen to the letter',
    replayLabel: 'Play letter again',
    answerLabel: 'Choose the correct letter',
    coloringInstructionLabel: 'Color the letter with your finger',
    bravoAlert: 'Great',
    speechPrefix: 'The letter: ',
  },
}

type SettingsText = {
  title: string
  languageTitle: string
  speechVoiceLabel: string
  speechVoiceDefaultOption: string
  speechVoiceUnavailableHint: string
  countingMaxObjectsLabel: string
  countingHintFirstDelayLabel: string
  countingHintNeverLabel: string
  countingHintRepeatDelayLabel: string
  answerPointerEnabledLabel: string
  answerPointerDelayLabel: string
  diceHintEnabledLabel: string
  reverseCountingMaxObjectsLabel: string
  letterListeningAllowedLettersLabel: string
  letterListeningAllLetters: string
  letterListeningNoLetters: string
  letterListeningMinLettersHint: string
  backHomeLabel: string
}

export const settingsTextByLanguage: Record<Language, SettingsText> = {
  fr: {
    title: 'Réglages',
    languageTitle: 'Langue',
    speechVoiceLabel: 'Voix de lecture',
    speechVoiceDefaultOption: 'Voix par défaut du navigateur',
    speechVoiceUnavailableHint: 'Aucune voix détectée sur cet appareil.',
    countingMaxObjectsLabel: "Nombre d'objets maximum",
    countingHintFirstDelayLabel: 'Premier indice après (secondes)',
    countingHintNeverLabel: 'Jamais',
    countingHintRepeatDelayLabel: "Répéter l'indice toutes les (secondes)",
    answerPointerEnabledLabel: 'Montrer la bonne réponse automatiquement',
    answerPointerDelayLabel: "Montrer l'animation après (secondes)",
    diceHintEnabledLabel: 'Montrer un dé à côté du chiffre',
    reverseCountingMaxObjectsLabel: "Nombre d'objets maximum",
    letterListeningAllowedLettersLabel: 'Lettres possibles dans le jeu',
    letterListeningAllLetters: 'Toutes',
    letterListeningNoLetters: 'Aucune',
    letterListeningMinLettersHint: 'Au moins 5 lettres (sinon toutes sont utilisées).',
    backHomeLabel: "Retour à l'accueil",
  },
  en: {
    title: 'Settings',
    languageTitle: 'Language',
    speechVoiceLabel: 'Speech voice',
    speechVoiceDefaultOption: 'Browser default voice',
    speechVoiceUnavailableHint: 'No speech voices detected on this device.',
    countingMaxObjectsLabel: 'Maximum number of objects',
    countingHintFirstDelayLabel: 'First hint after (seconds)',
    countingHintNeverLabel: 'Never',
    countingHintRepeatDelayLabel: 'Repeat hint every (seconds)',
    answerPointerEnabledLabel: 'Show the correct answer automatically',
    answerPointerDelayLabel: 'Show the animation after (seconds)',
    diceHintEnabledLabel: 'Show a die next to the number',
    reverseCountingMaxObjectsLabel: 'Maximum number of objects',
    letterListeningAllowedLettersLabel: 'Letters used in the game',
    letterListeningAllLetters: 'All',
    letterListeningNoLetters: 'None',
    letterListeningMinLettersHint: 'At least 5 letters (otherwise all are used).',
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

type QuantitySpeechLabel = {
  singular: string
  plural: string
}

export const quantitySpeechLabelByLanguage: Record<Language, Record<string, QuantitySpeechLabel>> = {
  fr: {
    fireTruck: { singular: 'camion pompier', plural: 'camions pompiers' },
    policeCar: { singular: 'voiture de police', plural: 'voitures de police' },
    ambulance: { singular: 'ambulance', plural: 'ambulances' },
    boat: { singular: 'bateau', plural: 'bateaux' },
    plane: { singular: 'avion', plural: 'avions' },
  },
  en: {
    fireTruck: { singular: 'fire truck', plural: 'fire trucks' },
    policeCar: { singular: 'police car', plural: 'police cars' },
    ambulance: { singular: 'ambulance', plural: 'ambulances' },
    boat: { singular: 'boat', plural: 'boats' },
    plane: { singular: 'plane', plural: 'planes' },
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

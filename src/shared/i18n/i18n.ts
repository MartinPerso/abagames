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

export const groupsGameNameByLanguage: Record<Language, string> = {
  fr: 'Jeu des Groupes',
  en: 'Groups Game',
}

type CountingGameText = {
  answerLabel: string
  soundOn: string
  soundOff: string
  coloringInstructionLabel: string
  bravoAlert: string
}

export const countingGameTextByLanguage: Record<Language, CountingGameText> = {
  fr: {
    answerLabel: 'Choisis un chiffre',
    soundOn: 'Son activé',
    soundOff: 'Son coupé',
    coloringInstructionLabel: 'Colorie le chiffre avec ton doigt',
    bravoAlert: 'Bravo',
  },
  en: {
    answerLabel: 'Choose a number',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    coloringInstructionLabel: 'Color the number with your finger',
    bravoAlert: 'Great',
  },
}

type InverseCountingGameText = {
  answerLabel: string
  coloringInstructionLabel: string
  bravoAlert: string
  speechPrefix: string
  replayLabel: string
}

export const inverseCountingGameTextByLanguage: Record<Language, InverseCountingGameText> = {
  fr: {
    answerLabel: 'Trouve le bon groupe',
    coloringInstructionLabel: 'Colorie le chiffre avec ton doigt',
    bravoAlert: 'Bravo',
    speechPrefix: 'Le chiffre ',
    replayLabel: 'Réécouter le chiffre',
  },
  en: {
    answerLabel: 'Find the matching group',
    coloringInstructionLabel: 'Color the number with your finger',
    bravoAlert: 'Great',
    speechPrefix: 'The number ',
    replayLabel: 'Play number again',
  },
}

type GroupsGameText = {
  answerLabel: string
  coloringInstructionLabel: string
  bravoAlert: string
  speechPrefix: string
  replayLabel: string
}

export const groupsGameTextByLanguage: Record<Language, GroupsGameText> = {
  fr: {
    answerLabel: 'Touche le groupe qui a le bon nombre',
    coloringInstructionLabel: 'Colorie le chiffre avec ton doigt',
    bravoAlert: 'Bravo',
    speechPrefix: 'Le chiffre ',
    replayLabel: 'Réécouter le chiffre',
  },
  en: {
    answerLabel: 'Tap the group with the right number',
    coloringInstructionLabel: 'Color the number with your finger',
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

type SuperRewardUiText = {
  modalTitle: string
  closeLabel: string
  tapToPlayLabel: string
}

export const superRewardUiTextByLanguage: Record<Language, SuperRewardUiText> = {
  fr: {
    modalTitle: 'Super récompense vidéo',
    closeLabel: 'Fermer et continuer',
    tapToPlayLabel: 'Touchez pour lancer la vidéo',
  },
  en: {
    modalTitle: 'Super reward video',
    closeLabel: 'Close and continue',
    tapToPlayLabel: 'Tap to play video',
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
  answerButtonsDelayLabel: string
  diceHintEnabledLabel: string
  coloringRewardModeLabel: string
  coloringRewardModeOffOption: string
  coloringRewardModeAfterOption: string
  coloringRewardModeInsteadOption: string
  reverseCountingMaxObjectsLabel: string
  groupsCountLabel: string
  groupsMaxObjectsLabel: string
  groupsMinGapLabel: string
  groupsMinGapHint: string
  groupsItemModeLabel: string
  groupsItemModeSameOption: string
  groupsItemModeDifferentOption: string
  groupsItemModeRandomOption: string
  letterListeningAllowedLettersLabel: string
  letterListeningAllLetters: string
  letterListeningNoLetters: string
  letterListeningMinLettersHint: string
  superRewardSectionTitle: string
  superRewardDescription: string
  superRewardEnabledLabel: string
  superRewardFirstTryStreakLabel: string
  superRewardVideosLabel: string
  superRewardVideoEnabledLabel: string
  superRewardVideoSourceLabel: string
  superRewardVideoSourceYouTubeOption: string
  superRewardVideoSourceLocalOption: string
  superRewardVideoUrlLabel: string
  superRewardLocalVideoLabel: string
  superRewardLocalVideoChooseLabel: string
  superRewardLocalVideoReplaceLabel: string
  superRewardLocalVideoMissingHint: string
  superRewardLocalVideoTooLargeHint: string
  superRewardLocalVideoTotalLimitHint: string
  superRewardLocalVideoSaveErrorHint: string
  superRewardLocalVideoStorageUsageLabel: string
  superRewardLocalVideoPersistenceGrantedHint: string
  superRewardLocalVideoPersistenceNotGrantedHint: string
  superRewardVideoStartLabel: string
  superRewardVideoDurationLabel: string
  superRewardAddVideoLabel: string
  superRewardRemoveVideoLabel: string
  superRewardNoVideosHint: string
  superRewardInvalidVideoHint: string
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
    answerButtonsDelayLabel: "Afficher les réponses après (secondes)",
    diceHintEnabledLabel: 'Montrer un dé à côté du chiffre',
    coloringRewardModeLabel: 'Récompense après une bonne réponse',
    coloringRewardModeOffOption: 'Objets animés seulement',
    coloringRewardModeAfterOption: 'Objets animés puis coloriage du chiffre',
    coloringRewardModeInsteadOption: 'Coloriage du chiffre seulement',
    reverseCountingMaxObjectsLabel: "Nombre d'objets maximum",
    groupsCountLabel: 'Nombre de groupes proposés',
    groupsMaxObjectsLabel: "Nombre d'objets maximum",
    groupsMinGapLabel: 'Écart minimum entre les groupes',
    groupsMinGapHint:
      "L'écart est réduit automatiquement quand le nombre d'objets maximum ne permet pas de le respecter.",
    groupsItemModeLabel: 'Véhicules des groupes',
    groupsItemModeSameOption: 'Le même partout',
    groupsItemModeDifferentOption: 'Un véhicule différent par groupe',
    groupsItemModeRandomOption: 'Au hasard à chaque tour',
    letterListeningAllowedLettersLabel: 'Lettres possibles dans le jeu',
    letterListeningAllLetters: 'Toutes',
    letterListeningNoLetters: 'Aucune',
    letterListeningMinLettersHint: 'Au moins 5 lettres (sinon toutes sont utilisées).',
    superRewardSectionTitle: 'Super renforçateur vidéo',
    superRewardDescription:
      'Ajoutez des vidéos YouTube pour les bonnes réponses du premier coup. Fermeture auto.',
    superRewardEnabledLabel: 'Activer la super récompense vidéo (1er essai)',
    superRewardFirstTryStreakLabel:
      'Afficher la super récompense après (bonnes réponses consécutives au 1er essai)',
    superRewardVideosLabel: 'Vidéos',
    superRewardVideoEnabledLabel: 'Activer cette vidéo',
    superRewardVideoSourceLabel: 'Source',
    superRewardVideoSourceYouTubeOption: 'YouTube',
    superRewardVideoSourceLocalOption: 'Appareil',
    superRewardVideoUrlLabel: 'URL YouTube',
    superRewardLocalVideoLabel: 'Vidéo locale',
    superRewardLocalVideoChooseLabel: 'Choisir une vidéo',
    superRewardLocalVideoReplaceLabel: 'Remplacer la vidéo',
    superRewardLocalVideoMissingHint: "Aucune vidéo locale n'est enregistrée pour cette entrée.",
    superRewardLocalVideoTooLargeHint: 'La vidéo dépasse la taille maximale autorisée.',
    superRewardLocalVideoTotalLimitHint:
      'Le stockage local des vidéos est plein. Supprimez une vidéo existante.',
    superRewardLocalVideoSaveErrorHint:
      "Impossible d'enregistrer cette vidéo localement sur cet appareil.",
    superRewardLocalVideoStorageUsageLabel: 'Stockage local vidéo utilisé',
    superRewardLocalVideoPersistenceGrantedHint:
      'Stockage persistant activé pour améliorer la conservation locale.',
    superRewardLocalVideoPersistenceNotGrantedHint:
      "Le stockage persistant n'a pas été accordé par le navigateur.",
    superRewardVideoStartLabel: 'Début (s)',
    superRewardVideoDurationLabel: 'Durée (s)',
    superRewardAddVideoLabel: 'Ajouter une vidéo',
    superRewardRemoveVideoLabel: 'Supprimer',
    superRewardNoVideosHint: 'Ajoutez au moins une vidéo pour utiliser cette récompense.',
    superRewardInvalidVideoHint:
      'URL YouTube invalide (ex: youtu.be/... ou youtube.com/watch?v=...)',
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
    answerButtonsDelayLabel: 'Show answer buttons after (seconds)',
    diceHintEnabledLabel: 'Show a die next to the number',
    coloringRewardModeLabel: 'Reward after a correct answer',
    coloringRewardModeOffOption: 'Animated objects only',
    coloringRewardModeAfterOption: 'Animated objects then number coloring',
    coloringRewardModeInsteadOption: 'Number coloring only',
    reverseCountingMaxObjectsLabel: 'Maximum number of objects',
    groupsCountLabel: 'Number of groups shown',
    groupsMaxObjectsLabel: 'Maximum number of objects',
    groupsMinGapLabel: 'Minimum gap between groups',
    groupsMinGapHint:
      'The gap is reduced automatically when the maximum number of objects cannot accommodate it.',
    groupsItemModeLabel: 'Vehicles in the groups',
    groupsItemModeSameOption: 'Same everywhere',
    groupsItemModeDifferentOption: 'A different vehicle per group',
    groupsItemModeRandomOption: 'Random each round',
    letterListeningAllowedLettersLabel: 'Letters used in the game',
    letterListeningAllLetters: 'All',
    letterListeningNoLetters: 'None',
    letterListeningMinLettersHint: 'At least 5 letters (otherwise all are used).',
    superRewardSectionTitle: 'Super video reward',
    superRewardDescription: 'Add YouTube videos for first-try correct answers. Auto-close enabled.',
    superRewardEnabledLabel: 'Enable super video reward (first try)',
    superRewardFirstTryStreakLabel:
      'Show super reward after (consecutive first-try correct answers)',
    superRewardVideosLabel: 'Videos',
    superRewardVideoEnabledLabel: 'Enable this video',
    superRewardVideoSourceLabel: 'Source',
    superRewardVideoSourceYouTubeOption: 'YouTube',
    superRewardVideoSourceLocalOption: 'Device',
    superRewardVideoUrlLabel: 'YouTube URL',
    superRewardLocalVideoLabel: 'Local video',
    superRewardLocalVideoChooseLabel: 'Choose video',
    superRewardLocalVideoReplaceLabel: 'Replace video',
    superRewardLocalVideoMissingHint: 'No local video is stored for this entry.',
    superRewardLocalVideoTooLargeHint: 'The video is too large for the per-file limit.',
    superRewardLocalVideoTotalLimitHint:
      'Local video storage is full. Remove an existing video first.',
    superRewardLocalVideoSaveErrorHint:
      'Unable to store this video locally on this device.',
    superRewardLocalVideoStorageUsageLabel: 'Local video storage used',
    superRewardLocalVideoPersistenceGrantedHint:
      'Persistent storage is enabled to improve local retention.',
    superRewardLocalVideoPersistenceNotGrantedHint:
      'The browser did not grant persistent storage.',
    superRewardVideoStartLabel: 'Start (s)',
    superRewardVideoDurationLabel: 'Duration (s)',
    superRewardAddVideoLabel: 'Add video',
    superRewardRemoveVideoLabel: 'Remove',
    superRewardNoVideosHint: 'Add at least one video to use this reward.',
    superRewardInvalidVideoHint:
      'Invalid YouTube URL (for example youtu.be/... or youtube.com/watch?v=...)',
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

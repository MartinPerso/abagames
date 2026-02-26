const COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-counting-max-objects'
const REVERSE_COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-reverse-counting-max-objects'
const LETTER_LISTENING_ALLOWED_LETTERS_STORAGE_KEY = 'abagames-letter-listening-allowed-letters'
const COUNTING_HINT_FIRST_DELAY_SECONDS_STORAGE_KEY =
  'abagames-counting-hint-first-delay-seconds'
const COUNTING_HINT_REPEAT_DELAY_SECONDS_STORAGE_KEY =
  'abagames-counting-hint-repeat-delay-seconds'
const COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY = 'abagames-counting-answer-pointer-enabled'
const REVERSE_COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY =
  'abagames-reverse-counting-answer-pointer-enabled'
const COUNTING_DICE_HINT_ENABLED_STORAGE_KEY = 'abagames-counting-dice-hint-enabled'
const REVERSE_COUNTING_DICE_HINT_ENABLED_STORAGE_KEY =
  'abagames-reverse-counting-dice-hint-enabled'
const LETTER_LISTENING_ANSWER_POINTER_ENABLED_STORAGE_KEY =
  'abagames-letter-listening-answer-pointer-enabled'
const COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY =
  'abagames-counting-answer-pointer-delay-seconds'
const REVERSE_COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY =
  'abagames-reverse-counting-answer-pointer-delay-seconds'
const LETTER_LISTENING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY =
  'abagames-letter-listening-answer-pointer-delay-seconds'
const SPEECH_VOICE_URI_STORAGE_KEY = 'abagames-speech-voice-uri'

export const ALL_ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const MIN_COUNTING_MAX_OBJECTS = 1
const MAX_COUNTING_MAX_OBJECTS = 10
const DEFAULT_COUNTING_MAX_OBJECTS = 5
const MIN_REVERSE_COUNTING_MAX_OBJECTS = 3
const MAX_REVERSE_COUNTING_MAX_OBJECTS = 10
const DEFAULT_REVERSE_COUNTING_MAX_OBJECTS = 5
const MIN_COUNTING_HINT_FIRST_DELAY_SECONDS = 1
const MAX_COUNTING_HINT_FIRST_DELAY_SECONDS = 10
const DEFAULT_COUNTING_HINT_FIRST_DELAY_SECONDS = 3
export const COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS = MAX_COUNTING_HINT_FIRST_DELAY_SECONDS + 1
const MIN_COUNTING_HINT_REPEAT_DELAY_SECONDS = 3
const MAX_COUNTING_HINT_REPEAT_DELAY_SECONDS = 20
const DEFAULT_COUNTING_HINT_REPEAT_DELAY_SECONDS = 10
const MIN_ANSWER_POINTER_DELAY_SECONDS = 5
const MAX_ANSWER_POINTER_DELAY_SECONDS = 20
const DEFAULT_ANSWER_POINTER_DELAY_SECONDS = 10

function clampCountingMaxObjects(value: number): number {
  return Math.max(MIN_COUNTING_MAX_OBJECTS, Math.min(MAX_COUNTING_MAX_OBJECTS, value))
}

function clampReverseCountingMaxObjects(value: number): number {
  return Math.max(
    MIN_REVERSE_COUNTING_MAX_OBJECTS,
    Math.min(MAX_REVERSE_COUNTING_MAX_OBJECTS, value),
  )
}

function clampCountingHintFirstDelaySeconds(value: number): number {
  return Math.max(
    MIN_COUNTING_HINT_FIRST_DELAY_SECONDS,
    Math.min(COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS, value),
  )
}

function clampCountingHintRepeatDelaySeconds(value: number): number {
  return Math.max(
    MIN_COUNTING_HINT_REPEAT_DELAY_SECONDS,
    Math.min(MAX_COUNTING_HINT_REPEAT_DELAY_SECONDS, value),
  )
}

function clampAnswerPointerDelaySeconds(value: number): number {
  return Math.max(
    MIN_ANSWER_POINTER_DELAY_SECONDS,
    Math.min(MAX_ANSWER_POINTER_DELAY_SECONDS, value),
  )
}

function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const raw = window.localStorage.getItem(key)
  if (raw === null) {
    return defaultValue
  }

  return raw === '1'
}

function setStoredBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, value ? '1' : '0')
}

function getStoredDelaySeconds(key: string): number {
  if (typeof window === 'undefined') {
    return DEFAULT_ANSWER_POINTER_DELAY_SECONDS
  }

  const raw = window.localStorage.getItem(key)
  if (raw === null) {
    return DEFAULT_ANSWER_POINTER_DELAY_SECONDS
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    return DEFAULT_ANSWER_POINTER_DELAY_SECONDS
  }
  return clampAnswerPointerDelaySeconds(Math.floor(parsed))
}

function setStoredDelaySeconds(key: string, value: number): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, String(clampAnswerPointerDelaySeconds(value)))
}

export function getStoredCountingMaxObjects(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_COUNTING_MAX_OBJECTS
  }

  const raw = window.localStorage.getItem(COUNTING_MAX_OBJECTS_STORAGE_KEY)
  if (raw === null) {
    return DEFAULT_COUNTING_MAX_OBJECTS
  }
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_COUNTING_MAX_OBJECTS
  }

  return clampCountingMaxObjects(Math.floor(parsed))
}

export function setStoredCountingMaxObjects(nextValue: number): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    COUNTING_MAX_OBJECTS_STORAGE_KEY,
    String(clampCountingMaxObjects(nextValue)),
  )
}

export function getStoredReverseCountingMaxObjects(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_REVERSE_COUNTING_MAX_OBJECTS
  }

  const raw = window.localStorage.getItem(REVERSE_COUNTING_MAX_OBJECTS_STORAGE_KEY)
  if (raw === null) {
    return DEFAULT_REVERSE_COUNTING_MAX_OBJECTS
  }
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_REVERSE_COUNTING_MAX_OBJECTS
  }

  return clampReverseCountingMaxObjects(Math.floor(parsed))
}

export function setStoredReverseCountingMaxObjects(nextValue: number): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    REVERSE_COUNTING_MAX_OBJECTS_STORAGE_KEY,
    String(clampReverseCountingMaxObjects(nextValue)),
  )
}

export const countingSettingsRange = {
  min: MIN_COUNTING_MAX_OBJECTS,
  max: MAX_COUNTING_MAX_OBJECTS,
  defaultValue: DEFAULT_COUNTING_MAX_OBJECTS,
}

export const reverseCountingSettingsRange = {
  min: MIN_REVERSE_COUNTING_MAX_OBJECTS,
  max: MAX_REVERSE_COUNTING_MAX_OBJECTS,
  defaultValue: DEFAULT_REVERSE_COUNTING_MAX_OBJECTS,
}

export function getStoredCountingHintFirstDelaySeconds(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_COUNTING_HINT_FIRST_DELAY_SECONDS
  }

  const raw = window.localStorage.getItem(COUNTING_HINT_FIRST_DELAY_SECONDS_STORAGE_KEY)
  if (raw === null) {
    return DEFAULT_COUNTING_HINT_FIRST_DELAY_SECONDS
  }
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_COUNTING_HINT_FIRST_DELAY_SECONDS
  }

  return clampCountingHintFirstDelaySeconds(Math.floor(parsed))
}

export function setStoredCountingHintFirstDelaySeconds(nextValue: number): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    COUNTING_HINT_FIRST_DELAY_SECONDS_STORAGE_KEY,
    String(clampCountingHintFirstDelaySeconds(nextValue)),
  )
}

export function getStoredCountingHintRepeatDelaySeconds(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_COUNTING_HINT_REPEAT_DELAY_SECONDS
  }

  const raw = window.localStorage.getItem(COUNTING_HINT_REPEAT_DELAY_SECONDS_STORAGE_KEY)
  if (raw === null) {
    return DEFAULT_COUNTING_HINT_REPEAT_DELAY_SECONDS
  }
  const parsed = Number(raw)

  if (!Number.isFinite(parsed)) {
    return DEFAULT_COUNTING_HINT_REPEAT_DELAY_SECONDS
  }

  return clampCountingHintRepeatDelaySeconds(Math.floor(parsed))
}

export function setStoredCountingHintRepeatDelaySeconds(nextValue: number): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    COUNTING_HINT_REPEAT_DELAY_SECONDS_STORAGE_KEY,
    String(clampCountingHintRepeatDelaySeconds(nextValue)),
  )
}

export const countingHintFirstDelaySettingsRange = {
  min: MIN_COUNTING_HINT_FIRST_DELAY_SECONDS,
  max: COUNTING_HINT_FIRST_DELAY_NEVER_SECONDS,
  defaultValue: DEFAULT_COUNTING_HINT_FIRST_DELAY_SECONDS,
}

export const countingHintRepeatDelaySettingsRange = {
  min: MIN_COUNTING_HINT_REPEAT_DELAY_SECONDS,
  max: MAX_COUNTING_HINT_REPEAT_DELAY_SECONDS,
  defaultValue: DEFAULT_COUNTING_HINT_REPEAT_DELAY_SECONDS,
}

export const answerPointerDelaySettingsRange = {
  min: MIN_ANSWER_POINTER_DELAY_SECONDS,
  max: MAX_ANSWER_POINTER_DELAY_SECONDS,
  defaultValue: DEFAULT_ANSWER_POINTER_DELAY_SECONDS,
}

export function getStoredCountingAnswerPointerEnabled(): boolean {
  return getStoredBoolean(COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY, true)
}

export function setStoredCountingAnswerPointerEnabled(enabled: boolean): void {
  setStoredBoolean(COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY, enabled)
}

export function getStoredReverseCountingAnswerPointerEnabled(): boolean {
  return getStoredBoolean(REVERSE_COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY, true)
}

export function setStoredReverseCountingAnswerPointerEnabled(enabled: boolean): void {
  setStoredBoolean(REVERSE_COUNTING_ANSWER_POINTER_ENABLED_STORAGE_KEY, enabled)
}

export function getStoredLetterListeningAnswerPointerEnabled(): boolean {
  return getStoredBoolean(LETTER_LISTENING_ANSWER_POINTER_ENABLED_STORAGE_KEY, true)
}

export function setStoredLetterListeningAnswerPointerEnabled(enabled: boolean): void {
  setStoredBoolean(LETTER_LISTENING_ANSWER_POINTER_ENABLED_STORAGE_KEY, enabled)
}

export function getStoredCountingDiceHintEnabled(): boolean {
  return getStoredBoolean(COUNTING_DICE_HINT_ENABLED_STORAGE_KEY, false)
}

export function setStoredCountingDiceHintEnabled(enabled: boolean): void {
  setStoredBoolean(COUNTING_DICE_HINT_ENABLED_STORAGE_KEY, enabled)
}

export function getStoredReverseCountingDiceHintEnabled(): boolean {
  return getStoredBoolean(REVERSE_COUNTING_DICE_HINT_ENABLED_STORAGE_KEY, false)
}

export function setStoredReverseCountingDiceHintEnabled(enabled: boolean): void {
  setStoredBoolean(REVERSE_COUNTING_DICE_HINT_ENABLED_STORAGE_KEY, enabled)
}

export function getStoredCountingAnswerPointerDelaySeconds(): number {
  return getStoredDelaySeconds(COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY)
}

export function setStoredCountingAnswerPointerDelaySeconds(value: number): void {
  setStoredDelaySeconds(COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY, value)
}

export function getStoredReverseCountingAnswerPointerDelaySeconds(): number {
  return getStoredDelaySeconds(REVERSE_COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY)
}

export function setStoredReverseCountingAnswerPointerDelaySeconds(value: number): void {
  setStoredDelaySeconds(REVERSE_COUNTING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY, value)
}

export function getStoredLetterListeningAnswerPointerDelaySeconds(): number {
  return getStoredDelaySeconds(LETTER_LISTENING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY)
}

export function setStoredLetterListeningAnswerPointerDelaySeconds(value: number): void {
  setStoredDelaySeconds(LETTER_LISTENING_ANSWER_POINTER_DELAY_SECONDS_STORAGE_KEY, value)
}

const MIN_ALLOWED_LETTERS = 5

function parseStoredLetterListeningLetters(raw: string | null): string[] {
  if (raw === null) {
    return [...ALL_ALPHABET_LETTERS]
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return [...ALL_ALPHABET_LETTERS]
    }
    const letters = parsed.filter(
      (item): item is string =>
        typeof item === 'string' && item.length === 1 && /^[A-Z]$/.test(item),
    )
    return [...new Set(letters)].sort((a, b) => a.localeCompare(b))
  } catch {
    return [...ALL_ALPHABET_LETTERS]
  }
}

/** Returns allowed letters for the game (at least 5; otherwise full alphabet). */
export function getStoredLetterListeningAllowedLetters(): string[] {
  if (typeof window === 'undefined') {
    return [...ALL_ALPHABET_LETTERS]
  }
  const stored = parseStoredLetterListeningLetters(
    window.localStorage.getItem(LETTER_LISTENING_ALLOWED_LETTERS_STORAGE_KEY),
  )
  return stored.length >= MIN_ALLOWED_LETTERS ? stored : [...ALL_ALPHABET_LETTERS]
}

/** Returns the raw stored selection for the settings UI (may be fewer than 5). */
export function getStoredLetterListeningAllowedLettersForSettings(): string[] {
  if (typeof window === 'undefined') {
    return [...ALL_ALPHABET_LETTERS]
  }
  return parseStoredLetterListeningLetters(
    window.localStorage.getItem(LETTER_LISTENING_ALLOWED_LETTERS_STORAGE_KEY),
  )
}

export function setStoredLetterListeningAllowedLetters(letters: string[]): void {
  if (typeof window === 'undefined') {
    return
  }
  const valid = letters.filter((c) => /^[A-Z]$/.test(c))
  const unique = [...new Set(valid)].sort((a, b) => a.localeCompare(b))
  window.localStorage.setItem(
    LETTER_LISTENING_ALLOWED_LETTERS_STORAGE_KEY,
    JSON.stringify(unique),
  )
}

export function getStoredSpeechVoiceUri(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const raw = window.localStorage.getItem(SPEECH_VOICE_URI_STORAGE_KEY)
  return raw ?? ''
}

export function setStoredSpeechVoiceUri(voiceUri: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SPEECH_VOICE_URI_STORAGE_KEY, voiceUri)
}

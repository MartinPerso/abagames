const COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-counting-max-objects'
const REVERSE_COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-reverse-counting-max-objects'
const LETTER_LISTENING_ALLOWED_LETTERS_STORAGE_KEY = 'abagames-letter-listening-allowed-letters'

export const ALL_ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const MIN_COUNTING_MAX_OBJECTS = 1
const MAX_COUNTING_MAX_OBJECTS = 10
const DEFAULT_COUNTING_MAX_OBJECTS = 5
const MIN_REVERSE_COUNTING_MAX_OBJECTS = 3
const MAX_REVERSE_COUNTING_MAX_OBJECTS = 10
const DEFAULT_REVERSE_COUNTING_MAX_OBJECTS = 5

function clampCountingMaxObjects(value: number): number {
  return Math.max(MIN_COUNTING_MAX_OBJECTS, Math.min(MAX_COUNTING_MAX_OBJECTS, value))
}

function clampReverseCountingMaxObjects(value: number): number {
  return Math.max(
    MIN_REVERSE_COUNTING_MAX_OBJECTS,
    Math.min(MAX_REVERSE_COUNTING_MAX_OBJECTS, value),
  )
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

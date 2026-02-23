const COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-counting-max-objects'
const REVERSE_COUNTING_MAX_OBJECTS_STORAGE_KEY = 'abagames-reverse-counting-max-objects'

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

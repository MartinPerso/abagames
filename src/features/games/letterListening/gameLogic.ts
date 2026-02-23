export const TOTAL_ROUNDS = 8
export const OPTIONS_PER_ROUND = 5

export type LetterRound = {
  roundIndex: number
  targetLetter: string
  options: string[]
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffled<T>(values: T[]): T[] {
  const next = [...values]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIntInclusive(0, index)
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }
  return next
}

export function createRound(roundIndex: number): LetterRound {
  const targetLetter = LETTERS[randomIntInclusive(0, LETTERS.length - 1)]
  const distractors = shuffled(LETTERS.filter((letter) => letter !== targetLetter)).slice(
    0,
    OPTIONS_PER_ROUND - 1,
  )
  const options = shuffled([targetLetter, ...distractors])

  return {
    roundIndex,
    targetLetter,
    options,
  }
}

export function isCorrectAnswer(round: LetterRound, letter: string): boolean {
  return round.targetLetter === letter
}

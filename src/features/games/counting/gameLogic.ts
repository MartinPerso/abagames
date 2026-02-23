export const TOTAL_ROUNDS = 8

export type CountingItem = 'fireTruck' | 'policeCar' | 'ambulance' | 'boat' | 'plane'

export type CountingRound = {
  roundIndex: number
  item: CountingItem
  count: number
}

const ITEMS: CountingItem[] = ['fireTruck', 'policeCar', 'ambulance', 'boat', 'plane']

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(): CountingItem {
  return ITEMS[randomIntInclusive(0, ITEMS.length - 1)]
}

export function createRound(roundIndex: number, maxObjects: number): CountingRound {
  return {
    roundIndex,
    item: randomItem(),
    count: randomIntInclusive(1, maxObjects),
  }
}

export function isCorrectAnswer(round: CountingRound, answer: number): boolean {
  return round.count === answer
}

export function getAnswerOptions(maxObjects: number): number[] {
  return Array.from({ length: maxObjects }, (_, index) => index + 1)
}

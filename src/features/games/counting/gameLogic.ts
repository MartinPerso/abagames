export const ANSWER_OPTIONS = [1, 2, 3, 4, 5] as const
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

export function createRound(roundIndex: number): CountingRound {
  return {
    roundIndex,
    item: randomItem(),
    count: randomIntInclusive(1, 5),
  }
}

export function isCorrectAnswer(round: CountingRound, answer: number): boolean {
  return round.count === answer
}

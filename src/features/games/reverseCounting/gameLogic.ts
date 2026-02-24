export type CountingItem = 'fireTruck' | 'policeCar' | 'ambulance' | 'boat' | 'plane'

export type ReverseCountingChoice = {
  id: string
  item: CountingItem
  count: number
}

export type ReverseCountingRound = {
  roundIndex: number
  targetCount: number
  choices: ReverseCountingChoice[]
  correctChoiceId: string
}

const ITEMS: CountingItem[] = ['fireTruck', 'policeCar', 'ambulance', 'boat', 'plane']

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

function pickRandomItems(count: number): CountingItem[] {
  return shuffled(ITEMS).slice(0, count)
}

function createDistractorCounts(targetCount: number, maxObjects: number): [number, number] {
  const availableCounts = Array.from({ length: maxObjects }, (_, index) => index + 1).filter(
    (value) => value !== targetCount,
  )

  if (availableCounts.length >= 2) {
    const [first, second] = shuffled(availableCounts)
    return [first, second]
  }

  if (targetCount <= 1) {
    return [targetCount + 1, targetCount + 2]
  }

  return [targetCount - 1, targetCount + 1]
}

export function createRound(roundIndex: number, maxObjects: number): ReverseCountingRound {
  const effectiveMaxObjects = Math.max(3, maxObjects)
  const targetCount = randomIntInclusive(1, effectiveMaxObjects)
  const [distractorA, distractorB] = createDistractorCounts(targetCount, effectiveMaxObjects)
  const [correctItem, distractorItemA, distractorItemB] = pickRandomItems(3)
  const correctChoiceId = `round-${roundIndex}-correct`

  const choices = shuffled<ReverseCountingChoice>([
    {
      id: correctChoiceId,
      item: correctItem,
      count: targetCount,
    },
    {
      id: `round-${roundIndex}-distractor-a`,
      item: distractorItemA,
      count: distractorA,
    },
    {
      id: `round-${roundIndex}-distractor-b`,
      item: distractorItemB,
      count: distractorB,
    },
  ])

  return {
    roundIndex,
    targetCount,
    choices,
    correctChoiceId,
  }
}

export function isCorrectAnswer(round: ReverseCountingRound, choiceId: string): boolean {
  return round.correctChoiceId === choiceId
}

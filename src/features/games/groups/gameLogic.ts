export type CountingItem = 'fireTruck' | 'policeCar' | 'ambulance' | 'boat' | 'plane'

export type GroupsItemMode = 'same' | 'different' | 'random'

export type GroupsChoice = {
  id: string
  item: CountingItem
  count: number
}

export type GroupsRound = {
  roundIndex: number
  targetCount: number
  choices: GroupsChoice[]
  correctChoiceId: string
}

export type GroupsRoundOptions = {
  groupCount: number
  maxObjects: number
  minGap: number
  itemMode: GroupsItemMode
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

/**
 * Caps the requested gap by the largest distance actually reachable from the
 * target, so the candidate list is never empty (max 5 / target 3 / gap 3 -> 2).
 * Distractor counts stay distinct while the pool allows it, then repeat: two
 * groups sharing a wrong count is still unambiguous, an empty group is not.
 */
function createDistractorCounts(
  targetCount: number,
  maxObjects: number,
  minGap: number,
  distractorCount: number,
): number[] {
  const reachableGap = Math.max(targetCount - 1, maxObjects - targetCount)
  const effectiveGap = Math.max(1, Math.min(minGap, reachableGap))
  const candidates = Array.from({ length: maxObjects }, (_, index) => index + 1).filter(
    (value) => Math.abs(value - targetCount) >= effectiveGap,
  )

  if (candidates.length === 0) {
    const fallback = targetCount > 1 ? targetCount - 1 : targetCount + 1
    return Array.from({ length: distractorCount }, () => fallback)
  }

  const pool = shuffled(candidates)
  return Array.from({ length: distractorCount }, (_, index) =>
    index < pool.length ? pool[index] : candidates[randomIntInclusive(0, candidates.length - 1)],
  )
}

function pickItems(itemMode: GroupsItemMode, groupCount: number): CountingItem[] {
  const useSameItem = itemMode === 'same' || (itemMode === 'random' && Math.random() < 0.5)

  if (useSameItem) {
    const item = ITEMS[randomIntInclusive(0, ITEMS.length - 1)]
    return Array.from({ length: groupCount }, () => item)
  }

  const pool = shuffled(ITEMS)
  return Array.from({ length: groupCount }, (_, index) => pool[index % pool.length])
}

export function createRound(roundIndex: number, options: GroupsRoundOptions): GroupsRound {
  const effectiveMaxObjects = Math.max(2, options.maxObjects)
  const effectiveGroupCount = Math.max(2, options.groupCount)
  const targetCount = randomIntInclusive(1, effectiveMaxObjects)
  const distractorCounts = createDistractorCounts(
    targetCount,
    effectiveMaxObjects,
    options.minGap,
    effectiveGroupCount - 1,
  )
  const items = pickItems(options.itemMode, effectiveGroupCount)
  const correctChoiceId = `round-${roundIndex}-correct`

  const choices = shuffled<GroupsChoice>([
    {
      id: correctChoiceId,
      item: items[0],
      count: targetCount,
    },
    ...distractorCounts.map((count, index) => ({
      id: `round-${roundIndex}-distractor-${index}`,
      item: items[index + 1],
      count,
    })),
  ])

  return {
    roundIndex,
    targetCount,
    choices,
    correctChoiceId,
  }
}

export function isCorrectAnswer(round: GroupsRound, choiceId: string): boolean {
  return round.correctChoiceId === choiceId
}

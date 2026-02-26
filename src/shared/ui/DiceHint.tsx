import './DiceHint.css'

type DiceHintProps = {
  value: number
  className?: string
}

type PipPosition = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'

const pipPositionsByFace: Record<number, PipPosition[]> = {
  1: ['mc'],
  2: ['tl', 'br'],
  3: ['tl', 'mc', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'mc', 'bl', 'br'],
  6: ['tl', 'ml', 'bl', 'tr', 'mr', 'br'],
}

function getDiceFaces(value: number): number[] {
  const bounded = Math.max(1, Math.min(10, Math.floor(value)))
  if (bounded <= 6) {
    return [bounded]
  }

  return [6, bounded - 6]
}

export function DiceHint({ value, className }: DiceHintProps) {
  const faces = getDiceFaces(value)

  return (
    <span className={`dice-hint ${className ?? ''}`.trim()} aria-hidden="true">
      {faces.map((face, index) => (
        <span key={`${face}-${index}`} className="dice-hint-face">
          {pipPositionsByFace[face].map((position) => (
            <span key={position} className={`dice-hint-pip is-${position}`} />
          ))}
        </span>
      ))}
    </span>
  )
}

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './GlyphColoringReward.css'

type GlyphMaskData = {
  size: number
  mask: Uint8Array
  totalPixels: number
  maskImageDataUrl: string
  glyphImageDataUrl: string
}

type ActiveStroke = {
  pointerId: number
  pathId: string
  x: number
  y: number
}

type GlyphColoringRewardProps = {
  glyph: string
  instructionLabel: string
  onComplete: () => void
}

const REWARD_VIEWBOX_SIZE = 100
const REWARD_MASK_SIZE = 170
const REWARD_BRUSH_RADIUS = 9.4
const REWARD_FILL_THRESHOLD = 0.9
const REWARD_COMPLETE_DELAY_MS = 500
export const COLORING_REWARD_RESULT_VISIBLE_MS = 5000
const REWARD_FONT_WEIGHT = 700
const REWARD_GLYPH_FILL_COLOR = '#f8d67b'
const REWARD_GLYPH_STROKE_COLOR = 'rgba(167, 122, 11, 0.52)'
const REWARD_GLYPH_STROKE_WIDTH_VIEWBOX = 1.2
const REWARD_FONT_FAMILY =
  '"Avenir Next Rounded", "Arial Rounded MT Bold", "Avenir Next", "Inter", sans-serif'

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLocalRewardPoint(
  target: HTMLDivElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = target.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  return {
    x: clampNumber(((clientX - rect.left) / rect.width) * REWARD_VIEWBOX_SIZE, 0, REWARD_VIEWBOX_SIZE),
    y: clampNumber(((clientY - rect.top) / rect.height) * REWARD_VIEWBOX_SIZE, 0, REWARD_VIEWBOX_SIZE),
  }
}

function createGlyphMaskData(glyph: string): GlyphMaskData | null {
  if (typeof document === 'undefined') {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = REWARD_MASK_SIZE
  canvas.height = REWARD_MASK_SIZE

  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  context.clearRect(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  context.fillStyle = '#000000'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  let fontSize = REWARD_MASK_SIZE * 0.84
  while (fontSize >= REWARD_MASK_SIZE * 0.48) {
    context.font = `${REWARD_FONT_WEIGHT} ${fontSize}px ${REWARD_FONT_FAMILY}`
    const metrics = context.measureText(glyph)
    const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    if (metrics.width <= REWARD_MASK_SIZE * 0.78 && glyphHeight <= REWARD_MASK_SIZE * 0.82) {
      break
    }
    fontSize -= 2
  }

  const glyphCenterX = REWARD_MASK_SIZE / 2
  const glyphCenterY = REWARD_MASK_SIZE / 2
  context.fillText(glyph, glyphCenterX, glyphCenterY)
  const imageData = context.getImageData(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  const mask = new Uint8Array(REWARD_MASK_SIZE * REWARD_MASK_SIZE)
  let totalPixels = 0

  for (let pixelIndex = 0; pixelIndex < mask.length; pixelIndex += 1) {
    if (imageData.data[pixelIndex * 4 + 3] < 28) {
      continue
    }
    mask[pixelIndex] = 1
    totalPixels += 1
  }

  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = REWARD_MASK_SIZE
  maskCanvas.height = REWARD_MASK_SIZE
  const maskContext = maskCanvas.getContext('2d')
  if (!maskContext) {
    return null
  }
  maskContext.clearRect(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  maskContext.fillStyle = '#000000'
  maskContext.fillRect(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  maskContext.textAlign = 'center'
  maskContext.textBaseline = 'middle'
  maskContext.font = `${REWARD_FONT_WEIGHT} ${fontSize}px ${REWARD_FONT_FAMILY}`
  maskContext.fillStyle = '#ffffff'
  maskContext.fillText(glyph, glyphCenterX, glyphCenterY)

  const glyphCanvas = document.createElement('canvas')
  glyphCanvas.width = REWARD_MASK_SIZE
  glyphCanvas.height = REWARD_MASK_SIZE
  const glyphContext = glyphCanvas.getContext('2d')
  if (!glyphContext) {
    return null
  }
  glyphContext.clearRect(0, 0, REWARD_MASK_SIZE, REWARD_MASK_SIZE)
  glyphContext.textAlign = 'center'
  glyphContext.textBaseline = 'middle'
  glyphContext.font = `${REWARD_FONT_WEIGHT} ${fontSize}px ${REWARD_FONT_FAMILY}`
  glyphContext.lineCap = 'round'
  glyphContext.lineJoin = 'round'
  glyphContext.strokeStyle = REWARD_GLYPH_STROKE_COLOR
  glyphContext.lineWidth =
    (REWARD_GLYPH_STROKE_WIDTH_VIEWBOX / REWARD_VIEWBOX_SIZE) * REWARD_MASK_SIZE
  glyphContext.fillStyle = REWARD_GLYPH_FILL_COLOR
  // Match previous paint-order: stroke under fill
  glyphContext.strokeText(glyph, glyphCenterX, glyphCenterY)
  glyphContext.fillText(glyph, glyphCenterX, glyphCenterY)

  return {
    size: REWARD_MASK_SIZE,
    mask,
    totalPixels,
    maskImageDataUrl: maskCanvas.toDataURL(),
    glyphImageDataUrl: glyphCanvas.toDataURL(),
  }
}

function markCoverageCircle(
  centerX: number,
  centerY: number,
  radius: number,
  maskData: GlyphMaskData,
  visitedPixels: Uint8Array,
): number {
  const startX = clampNumber(Math.floor(centerX - radius), 0, maskData.size - 1)
  const endX = clampNumber(Math.ceil(centerX + radius), 0, maskData.size - 1)
  const startY = clampNumber(Math.floor(centerY - radius), 0, maskData.size - 1)
  const endY = clampNumber(Math.ceil(centerY + radius), 0, maskData.size - 1)
  const radiusSquared = radius * radius
  let addedPixels = 0

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const dx = x - centerX
      const dy = y - centerY
      if (dx * dx + dy * dy > radiusSquared) {
        continue
      }

      const pixelIndex = y * maskData.size + x
      if (maskData.mask[pixelIndex] === 0 || visitedPixels[pixelIndex] === 1) {
        continue
      }

      visitedPixels[pixelIndex] = 1
      addedPixels += 1
    }
  }

  return addedPixels
}

function markCoverageSegment(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  maskData: GlyphMaskData,
  visitedPixels: Uint8Array,
): number {
  const scale = maskData.size / REWARD_VIEWBOX_SIZE
  const radius = REWARD_BRUSH_RADIUS * scale
  const dx = toX - fromX
  const dy = toY - fromY
  const distance = Math.hypot(dx, dy)
  const steps = Math.max(1, Math.ceil(distance / (REWARD_BRUSH_RADIUS * 0.5)))
  let addedPixels = 0

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps
    const x = (fromX + dx * t) * scale
    const y = (fromY + dy * t) * scale
    addedPixels += markCoverageCircle(x, y, radius, maskData, visitedPixels)
  }

  return addedPixels
}

export function GlyphColoringReward({ glyph, instructionLabel, onComplete }: GlyphColoringRewardProps) {
  const [paths, setPaths] = useState<Array<{ id: string; d: string }>>([])
  const [progress, setProgress] = useState(0)
  const [glyphRenderData, setGlyphRenderData] = useState<{
    maskImageDataUrl: string
    glyphImageDataUrl: string
  } | null>(null)
  const glyphMaskId = useId().replace(/:/g, '')
  const maskDataRef = useRef<GlyphMaskData | null>(null)
  const visitedPixelsRef = useRef<Uint8Array>(new Uint8Array(0))
  const coveredPixelsRef = useRef(0)
  const progressRef = useRef(0)
  const completionScheduledRef = useRef(false)
  const completionTimerRef = useRef<number | null>(null)
  const activeStrokeRef = useRef<ActiveStroke | null>(null)

  useEffect(() => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current)
      completionTimerRef.current = null
    }

    const maskData = createGlyphMaskData(glyph)
    maskDataRef.current = maskData
    setGlyphRenderData(
      maskData
        ? {
            maskImageDataUrl: maskData.maskImageDataUrl,
            glyphImageDataUrl: maskData.glyphImageDataUrl,
          }
        : null,
    )
    visitedPixelsRef.current = new Uint8Array(maskData?.size ? maskData.size * maskData.size : 0)
    coveredPixelsRef.current = 0
    progressRef.current = 0
    completionScheduledRef.current = false
    activeStrokeRef.current = null
    setPaths([])
    setProgress(0)

    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current)
        completionTimerRef.current = null
      }
    }
  }, [glyph])

  const updateRewardProgress = useCallback(
    (addedPixels: number) => {
      if (addedPixels <= 0) {
        return
      }

      const maskData = maskDataRef.current
      if (!maskData || maskData.totalPixels === 0) {
        return
      }

      coveredPixelsRef.current += addedPixels
      const nextProgress = Math.min(1, coveredPixelsRef.current / maskData.totalPixels)
      progressRef.current = nextProgress
      setProgress((current) => (nextProgress > current ? nextProgress : current))
    },
    [],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (completionScheduledRef.current) {
        return
      }

      const localPoint = getLocalRewardPoint(event.currentTarget, event.clientX, event.clientY)
      if (!localPoint) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)

      const pathId = `${event.pointerId}-${Date.now()}-${Math.round(Math.random() * 10_000)}`
      const startPoint = `${localPoint.x.toFixed(2)} ${localPoint.y.toFixed(2)}`
      setPaths((current) => [...current, { id: pathId, d: `M ${startPoint}` }])

      activeStrokeRef.current = {
        pointerId: event.pointerId,
        pathId,
        x: localPoint.x,
        y: localPoint.y,
      }

      const maskData = maskDataRef.current
      if (!maskData) {
        return
      }

      const addedPixels = markCoverageSegment(
        localPoint.x,
        localPoint.y,
        localPoint.x,
        localPoint.y,
        maskData,
        visitedPixelsRef.current,
      )
      updateRewardProgress(addedPixels)
    },
    [updateRewardProgress],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeStroke = activeStrokeRef.current
      if (!activeStroke || activeStroke.pointerId !== event.pointerId || completionScheduledRef.current) {
        return
      }

      const localPoint = getLocalRewardPoint(event.currentTarget, event.clientX, event.clientY)
      if (!localPoint) {
        return
      }

      event.preventDefault()

      const segment = ` L ${localPoint.x.toFixed(2)} ${localPoint.y.toFixed(2)}`
      setPaths((current) => {
        return current.map((path) =>
          path.id === activeStroke.pathId ? { ...path, d: `${path.d}${segment}` } : path,
        )
      })

      const maskData = maskDataRef.current
      if (maskData) {
        const addedPixels = markCoverageSegment(
          activeStroke.x,
          activeStroke.y,
          localPoint.x,
          localPoint.y,
          maskData,
          visitedPixelsRef.current,
        )
        updateRewardProgress(addedPixels)
      }

      activeStrokeRef.current = {
        ...activeStroke,
        x: localPoint.x,
        y: localPoint.y,
      }
    },
    [updateRewardProgress],
  )

  const endStroke = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const activeStroke = activeStrokeRef.current
      if (!activeStroke || activeStroke.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      activeStrokeRef.current = null

      if (
        event.type === 'pointerup' &&
        progressRef.current >= REWARD_FILL_THRESHOLD &&
        !completionScheduledRef.current
      ) {
        completionScheduledRef.current = true
        completionTimerRef.current = window.setTimeout(() => {
          completionTimerRef.current = null
          onComplete()
        }, REWARD_COMPLETE_DELAY_MS)
      }
    },
    [onComplete],
  )

  return (
    <div className="glyph-reward">
      <div
        className="glyph-reward-stage"
        role="img"
        aria-label={`${instructionLabel}: ${glyph}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      >
        <svg className="glyph-reward-svg" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            {glyphRenderData ? (
              <mask id={glyphMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                <image
                  href={glyphRenderData.maskImageDataUrl}
                  xlinkHref={glyphRenderData.maskImageDataUrl}
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  preserveAspectRatio="none"
                />
              </mask>
            ) : null}
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="rgba(255, 255, 255, 0.66)" />
          {glyphRenderData ? (
            <image
              href={glyphRenderData.glyphImageDataUrl}
              xlinkHref={glyphRenderData.glyphImageDataUrl}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="none"
            />
          ) : null}
          <g mask={glyphRenderData ? `url(#${glyphMaskId})` : undefined}>
            {paths.map((path) => (
              <path key={path.id} d={path.d} className="reward-brush-stroke" />
            ))}
          </g>
        </svg>
      </div>

      <div className="glyph-reward-progress" aria-hidden="true">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  )
}

export type SuperRewardVideoInput = {
  youtubeUrl: string
  startSeconds: number
  durationSeconds: number
}

export type PlayableSuperRewardVideo = {
  videoId: string
  startSeconds: number
  durationMs: number
  embedUrl: string
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/
const DEFAULT_DURATION_SECONDS = 15

function sanitizeStartSeconds(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.floor(value))
}

function sanitizeDurationSeconds(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_DURATION_SECONDS
  }

  return Math.max(1, Math.floor(value))
}

function normalizeUrlCandidate(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (trimmed === '') {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

function extractVideoIdFromPath(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) {
    return null
  }

  const candidate = pathname.slice(prefix.length).split('/')[0]
  if (!candidate) {
    return null
  }

  return candidate
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  const normalizedUrl = normalizeUrlCandidate(rawUrl)
  if (normalizedUrl === '') {
    return null
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return null
  }

  const host = parsedUrl.hostname.toLowerCase()
  const pathname = parsedUrl.pathname
  let candidateId: string | null = null

  if (host === 'youtu.be') {
    candidateId = pathname.slice(1).split('/')[0] ?? null
  } else if (host.endsWith('youtube.com')) {
    if (pathname === '/watch') {
      candidateId = parsedUrl.searchParams.get('v')
    }

    candidateId ??= extractVideoIdFromPath(pathname, '/embed/')
    candidateId ??= extractVideoIdFromPath(pathname, '/shorts/')
    candidateId ??= extractVideoIdFromPath(pathname, '/live/')
  }

  if (!candidateId || !YOUTUBE_VIDEO_ID_PATTERN.test(candidateId)) {
    return null
  }

  return candidateId
}

export function createYouTubeEmbedUrl(videoId: string, startSeconds: number): string {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    playsinline: '1',
  })

  if (startSeconds > 0) {
    params.set('start', String(startSeconds))
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function toPlayableSuperRewardVideo(
  video: SuperRewardVideoInput,
): PlayableSuperRewardVideo | null {
  const videoId = extractYouTubeVideoId(video.youtubeUrl)
  if (!videoId) {
    return null
  }

  const startSeconds = sanitizeStartSeconds(video.startSeconds)
  const durationSeconds = sanitizeDurationSeconds(video.durationSeconds)

  return {
    videoId,
    startSeconds,
    durationMs: durationSeconds * 1000,
    embedUrl: createYouTubeEmbedUrl(videoId, startSeconds),
  }
}

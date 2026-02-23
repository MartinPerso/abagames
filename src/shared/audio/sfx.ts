import type { CountingItem } from '../../features/games/counting/gameLogic'

const sfxBaseUrl = `${import.meta.env.BASE_URL}assets/sfx`

const sfxByItem: Record<CountingItem, string> = {
  fireTruck: `${sfxBaseUrl}/fireTruck.mp3`,
  policeCar: `${sfxBaseUrl}/policeCar.mp3`,
  ambulance: `${sfxBaseUrl}/ambulance.mp3`,
  boat: `${sfxBaseUrl}/boat.mp3`,
  plane: `${sfxBaseUrl}/plane.mp3`,
}

const audioByPath = new Map<string, HTMLAudioElement>()
let stopTimer: number | null = null
let currentAudio: HTMLAudioElement | null = null
export const REWARD_SFX_DURATION_MS = 5000

export function playRewardSfx(item: CountingItem): void {
  if (typeof window === 'undefined') {
    return
  }

  const path = sfxByItem[item]
  let audio = audioByPath.get(path)
  if (!audio) {
    audio = new window.Audio(path)
    audio.preload = 'auto'
    audioByPath.set(path, audio)
  }

  if (stopTimer !== null) {
    window.clearTimeout(stopTimer)
  }

  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio.loop = false
  }

  audio.currentTime = 0
  audio.loop = true
  currentAudio = audio
  void audio.play()

  stopTimer = window.setTimeout(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio.loop = false
    }
    stopTimer = null
  }, REWARD_SFX_DURATION_MS)
}

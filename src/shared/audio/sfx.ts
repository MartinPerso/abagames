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

export function playSuccessJingle(): void {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextCtor = window.AudioContext
  if (!AudioContextCtor) {
    return
  }

  const context = new AudioContextCtor()
  const now = context.currentTime
  const notes = [659.25, 783.99, 987.77]

  notes.forEach((frequency, index) => {
    const osc = context.createOscillator()
    const gain = context.createGain()
    const start = now + index * 0.09
    const end = start + 0.16

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    osc.connect(gain)
    gain.connect(context.destination)
    osc.start(start)
    osc.stop(end)
  })

  window.setTimeout(() => {
    void context.close()
  }, 500)
}

export function triggerLightVibration(): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return
  }

  navigator.vibrate(24)
}

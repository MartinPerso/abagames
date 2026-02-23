import type { CountingItem } from '../../features/games/counting/gameLogic'

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    audioContext = new window.AudioContext()
  }

  return audioContext
}

function playTone(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  gain.gain.setValueAtTime(gainValue, startAt)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration)
}

function playVehicleSiren(context: AudioContext, now: number): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(520, now)
  oscillator.frequency.linearRampToValueAtTime(830, now + 0.16)
  oscillator.frequency.linearRampToValueAtTime(480, now + 0.32)
  oscillator.frequency.linearRampToValueAtTime(860, now + 0.48)
  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.52)
}

function playBoatHorn(context: AudioContext, now: number): void {
  playTone(context, 140, now, 0.32, 'triangle', 0.08)
  playTone(context, 190, now + 0.18, 0.28, 'triangle', 0.06)
}

function playPlaneSound(context: AudioContext, now: number): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(200, now)
  oscillator.frequency.linearRampToValueAtTime(460, now + 0.45)
  gain.gain.setValueAtTime(0.04, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.5)
}

export function playRewardSfx(item: CountingItem): void {
  const context = getContext()
  if (!context) {
    return
  }

  const now = context.currentTime + 0.02

  if (item === 'boat') {
    playBoatHorn(context, now)
    return
  }

  if (item === 'plane') {
    playPlaneSound(context, now)
    return
  }

  playVehicleSiren(context, now)
}

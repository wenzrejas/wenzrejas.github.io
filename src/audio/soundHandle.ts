import { DEFAULT_FADE, STOP_MARGIN_SECONDS } from './constants'

export class SoundHandle {
  private context: AudioContext | null = null
  private gain: GainNode | null = null
  private halt: ((at: number) => void) | null = null
  private baseVolume = 1
  private stopped = false
  private onDone: (() => void) | null = null

  get active(): boolean {
    return !this.stopped
  }

  whenDone(callback: () => void): void {
    if (this.stopped) callback()
    else this.onDone = callback
  }

  private release(): void {
    const callback = this.onDone
    this.onDone = null
    callback?.()
  }

  attach(context: AudioContext, gain: GainNode, baseVolume: number, halt: (at: number) => void) {
    this.context = context
    this.gain = gain
    this.baseVolume = baseVolume
    this.halt = halt
  }

  finish(): void {
    this.stopped = true
    this.release()
  }

  setVolume(volume: number, seconds = DEFAULT_FADE): void {
    if (!this.context || !this.gain || this.stopped) return
    const now = this.context.currentTime
    this.gain.gain.cancelScheduledValues(now)
    this.gain.gain.setValueAtTime(this.gain.gain.value, now)
    this.gain.gain.linearRampToValueAtTime(volume * this.baseVolume, now + seconds)
  }

  stop(fade = DEFAULT_FADE): void {
    if (this.stopped) return
    this.stopped = true
    this.release()
    if (!this.context || !this.gain || !this.halt) return
    const now = this.context.currentTime
    this.gain.gain.cancelScheduledValues(now)
    this.gain.gain.setValueAtTime(this.gain.gain.value, now)
    this.gain.gain.linearRampToValueAtTime(0, now + fade)
    this.halt(now + fade + STOP_MARGIN_SECONDS)
  }
}

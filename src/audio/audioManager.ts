import {
  CHANNEL_VOLUMES,
  DEFAULT_FADE,
  MASTER_VOLUME,
  MUSIC_CROSSFADE,
  MUSIC_DUCK,
  MUSIC_DUCK_ATTACK,
  MUSIC_DUCK_RELEASE,
  SILENCE_THRESHOLD,
} from './constants'
import { SOUNDS, type Channel, type SoundDefinition, type SoundName } from './sounds'

export interface PlayOptions {
  volume?: number
  rate?: number
  loop?: boolean
  fadeIn?: number
}

interface LoopRange {
  start: number
  end: number
}

const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

const MEDIA_TYPES: Record<string, string> = {
  webm: 'audio/webm; codecs="opus"',
  mp3: 'audio/mpeg',
}

let probe: HTMLAudioElement | null = null

function playable(url: string): boolean {
  const type = MEDIA_TYPES[url.split('.').pop() ?? '']
  if (!type) return true
  probe ??= new Audio()
  return probe.canPlayType(type) !== ''
}

function preferredSource(definition: SoundDefinition): string {
  return definition.fallback && !playable(definition.url) ? definition.fallback : definition.url
}

// ── Handle ────────────────────────────────────────────────────────────────────

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
    this.halt(now + fade + 0.05)
  }
}

// ── Manager ───────────────────────────────────────────────────────────────────

class AudioManager {
  private context: AudioContext | null = null
  private channels: Record<Channel, GainNode> | null = null
  private buffers = new Map<SoundName, Promise<AudioBuffer>>()
  private loopRanges = new WeakMap<AudioBuffer, LoopRange>()
  private pending: (() => void)[] = []
  private unlocked = false
  private ducks = 0
  private music: { name: SoundName; handle: SoundHandle } | null = null

  install(): void {
    if (this.context) return
    this.context = new AudioContext()
    const master = this.context.createGain()
    master.gain.value = MASTER_VOLUME
    master.connect(this.context.destination)

    const createChannel = (channel: Channel) => {
      const gain = this.context!.createGain()
      gain.gain.value = CHANNEL_VOLUMES[channel]
      gain.connect(master)
      return gain
    }
    this.channels = {
      music: createChannel('music'),
      ambience: createChannel('ambience'),
      sfx: createChannel('sfx'),
    }

    for (const event of UNLOCK_EVENTS) window.addEventListener(event, this.unlock, true)
    document.addEventListener('visibilitychange', this.syncVisibility)
  }

  get ready(): boolean {
    return this.context?.state === 'running'
  }

  play(name: SoundName, options: PlayOptions = {}): SoundHandle {
    const handle = new SoundHandle()
    if (!this.context || (!this.ready && !options.loop)) {
      handle.stop(0)
      return handle
    }

    const definition: SoundDefinition = SOUNDS[name]
    if (definition.stream) {
      const start = () => this.startStream(handle, name, options)
      if (this.ready) start()
      else this.pending.push(start)
      return handle
    }

    this.load(name)
      .then((buffer) => {
        const start = () => this.start(handle, name, buffer, options)
        if (this.ready) start()
        else this.pending.push(start)
      })
      .catch((error: unknown) => {
        this.buffers.delete(name)
        handle.stop(0)
        console.warn(`Could not play sound "${name}"`, error)
      })
    return handle
  }

  playMusic(name: SoundName, crossfade = MUSIC_CROSSFADE): void {
    if (this.music?.name === name && this.music.handle.active) return
    this.music?.handle.stop(crossfade)
    this.music = { name, handle: this.play(name, { loop: true, fadeIn: crossfade }) }
  }

  stopMusic(fade = MUSIC_CROSSFADE): void {
    this.music?.handle.stop(fade)
    this.music = null
  }

  duck(): () => void {
    this.ducks++
    this.applyDuck()
    let released = false
    return () => {
      if (released) return
      released = true
      this.ducks--
      this.applyDuck()
    }
  }

  private applyDuck(): void {
    const ducked = this.ducks > 0
    this.setChannelVolume(
      'music',
      CHANNEL_VOLUMES.music * (ducked ? MUSIC_DUCK : 1),
      ducked ? MUSIC_DUCK_ATTACK : MUSIC_DUCK_RELEASE
    )
  }

  setChannelVolume(channel: Channel, volume: number, seconds = DEFAULT_FADE): void {
    if (!this.context || !this.channels) return
    const gain = this.channels[channel].gain
    const now = this.context.currentTime
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(volume, now + seconds)
  }

  private start(handle: SoundHandle, name: SoundName, buffer: AudioBuffer, options: PlayOptions) {
    if (!handle.active || !this.context || !this.channels) return
    const definition = SOUNDS[name]
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = options.rate ?? 1

    let offset = 0
    if (options.loop) {
      const range = this.loopRange(buffer)
      source.loop = true
      source.loopStart = range.start
      source.loopEnd = range.end
      offset = range.start
    }

    const gain = this.createEnvelope(name, options)
    source.connect(gain).connect(this.channels[definition.channel])
    source.addEventListener('ended', () => handle.finish())
    source.start(this.context.currentTime, offset)
    handle.attach(this.context, gain, definition.volume, (at) => source.stop(at))
  }

  private startStream(handle: SoundHandle, name: SoundName, options: PlayOptions) {
    if (!handle.active || !this.context || !this.channels) return
    const context = this.context
    const definition: SoundDefinition = SOUNDS[name]
    const element = new Audio(preferredSource(definition))
    element.loop = options.loop ?? false
    element.playbackRate = options.rate ?? 1

    const source = context.createMediaElementSource(element)
    const gain = this.createEnvelope(name, options)
    source.connect(gain).connect(this.channels[definition.channel])

    const release = () => {
      element.pause()
      element.removeAttribute('src')
      element.load()
      source.disconnect()
    }
    element.addEventListener('ended', () => {
      handle.finish()
      release()
    })

    let swapped = false
    const start = () => {
      element.play().catch((error: unknown) => {
        if (!swap()) {
          handle.stop(0)
          release()
          console.warn(`Could not stream sound "${name}"`, error)
        }
      })
    }
    const swap = (): boolean => {
      if (swapped || !definition.fallback || element.src.endsWith(definition.fallback)) return false
      swapped = true
      console.warn(`Falling back to "${definition.fallback}" for "${name}"`)
      element.src = definition.fallback
      element.load()
      start()
      return true
    }
    element.addEventListener('error', () => {
      if (handle.active) swap()
    })
    start()
    handle.attach(context, gain, definition.volume, (at) => {
      window.setTimeout(release, Math.max(0, (at - context.currentTime) * 1000))
    })
  }

  private createEnvelope(name: SoundName, options: PlayOptions): GainNode {
    const volume = (options.volume ?? 1) * SOUNDS[name].volume
    const gain = this.context!.createGain()
    const now = this.context!.currentTime
    if (options.fadeIn) {
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(volume, now + options.fadeIn)
    } else {
      gain.gain.setValueAtTime(volume, now)
    }
    return gain
  }

  private load(name: SoundName): Promise<AudioBuffer> {
    let buffer = this.buffers.get(name)
    if (!buffer) {
      const definition: SoundDefinition = SOUNDS[name]
      const source = preferredSource(definition)
      buffer = this.decode(source).catch((error: unknown) => {
        if (!definition.fallback || definition.fallback === source) throw error
        console.warn(`Falling back to "${definition.fallback}"`, error)
        return this.decode(definition.fallback)
      })
      this.buffers.set(name, buffer)
    }
    return buffer
  }

  private decode(url: string): Promise<AudioBuffer> {
    return fetch(url)
      .then((response) => response.arrayBuffer())
      .then((data) => this.context!.decodeAudioData(data))
  }

  private loopRange(buffer: AudioBuffer): LoopRange {
    const cached = this.loopRanges.get(buffer)
    if (cached) return cached

    const samples = buffer.getChannelData(0)
    let first = 0
    while (first < samples.length && Math.abs(samples[first]) < SILENCE_THRESHOLD) first++
    let last = samples.length - 1
    while (last > first && Math.abs(samples[last]) < SILENCE_THRESHOLD) last--

    const range = { start: first / buffer.sampleRate, end: (last + 1) / buffer.sampleRate }
    this.loopRanges.set(buffer, range)
    return range
  }

  private startPending = (): void => {
    for (const start of this.pending.splice(0)) start()
  }

  private unlock = (): void => {
    if (!this.context || this.unlocked) return
    this.context.resume().then(() => {
      this.unlocked = true
      for (const event of UNLOCK_EVENTS) window.removeEventListener(event, this.unlock, true)
      this.startPending()
    })
  }

  private syncVisibility = (): void => {
    if (!this.context || !this.unlocked) return
    if (document.hidden) this.context.suspend()
    else this.context.resume().then(this.startPending)
  }
}

export const audio = new AudioManager()

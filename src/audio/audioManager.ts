import { audibleRangeOf } from './audibleRange'
import {
  CHANNEL_VOLUMES,
  DEFAULT_FADE,
  MASTER_VOLUME,
  MUSIC_CROSSFADE,
  MUSIC_DUCK,
  MUSIC_DUCK_ATTACK,
  MUSIC_DUCK_RELEASE,
  MUTE_SMOOTHING,
} from './constants'
import { SoundHandle } from './soundHandle'
import { decodeSource, downloadSource, preferredSource } from './soundSources'
import { SOUNDS, type Channel, type SoundDefinition, type SoundName } from './sounds'
import { StreamPlayers } from './streamPlayers'

interface PlayOptions {
  volume?: number
  rate?: number
  loop?: boolean
  fadeIn?: number
}

interface AudioGraph {
  context: AudioContext
  master: GainNode
  channels: Record<Channel, GainNode>
  visitorGains: Record<Channel, GainNode>
  streams: StreamPlayers
}

const UNLOCK_EVENTS = [
  'pointerdown',
  'pointerup',
  'keydown',
  'touchstart',
  'touchend',
  'click',
] as const
const GESTURE_EVENTS = ['touchend', 'click', 'keydown'] as const

const definitionOf = (name: SoundName): SoundDefinition => SOUNDS[name]

function buildAudioGraph(): AudioGraph {
  const context = new AudioContext()
  const master = context.createGain()
  master.gain.value = MASTER_VOLUME
  master.connect(context.destination)

  const createVisitorGain = () => {
    const gain = context.createGain()
    gain.connect(master)
    return gain
  }
  const visitorGains = {
    music: createVisitorGain(),
    ambience: createVisitorGain(),
    sfx: createVisitorGain(),
  }

  const createChannel = (channel: Channel) => {
    const gain = context.createGain()
    gain.gain.value = CHANNEL_VOLUMES[channel]
    gain.connect(visitorGains[channel])
    return gain
  }
  const channels = {
    music: createChannel('music'),
    ambience: createChannel('ambience'),
    sfx: createChannel('sfx'),
  }

  return { context, master, channels, visitorGains, streams: new StreamPlayers(context) }
}

function createEnvelope(context: AudioContext, name: SoundName, options: PlayOptions): GainNode {
  const volume = (options.volume ?? 1) * SOUNDS[name].volume
  const gain = context.createGain()
  const now = context.currentTime
  if (options.fadeIn) {
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + options.fadeIn)
  } else {
    gain.gain.setValueAtTime(volume, now)
  }
  return gain
}

const warnResumeFailed = (error: unknown) => console.warn('Could not resume audio', error)

class AudioManager {
  private graph: AudioGraph | null = null
  private buffers = new Map<SoundName, Promise<AudioBuffer>>()
  private pending: (() => void)[] = []
  private unlocked = false
  private ducks = 0
  private silences = 0
  private music: { name: SoundName; handle: SoundHandle } | null = null

  install(): void {
    if (this.graph) return
    this.graph = buildAudioGraph()
    for (const event of UNLOCK_EVENTS) window.addEventListener(event, this.unlock, true)
    for (const event of GESTURE_EVENTS)
      window.addEventListener(event, this.readyStreamPlayers, true)
    document.addEventListener('visibilitychange', this.syncVisibility)
  }

  get ready(): boolean {
    return this.graph?.context.state === 'running'
  }

  play(name: SoundName, options: PlayOptions = {}): SoundHandle {
    const handle = new SoundHandle()
    if (!this.graph || (!this.ready && !options.loop)) {
      handle.stop(0)
      return handle
    }

    if (definitionOf(name).stream) {
      this.startWhenReady(() => this.startStream(handle, name, options))
      return handle
    }

    this.load(name)
      .then((buffer) => this.startWhenReady(() => this.start(handle, name, buffer, options)))
      .catch((error: unknown) => {
        this.buffers.delete(name)
        handle.stop(0)
        console.warn(`Could not play sound "${name}"`, error)
      })
    return handle
  }

  private startWhenReady(start: () => void): void {
    if (this.ready) start()
    else this.pending.push(start)
  }

  async preload(name: SoundName): Promise<void> {
    const definition = definitionOf(name)
    try {
      if (definition.stream) await downloadSource(preferredSource(definition))
      else if (this.graph) await this.load(name)
    } catch {
      this.buffers.delete(name)
    }
  }

  async preloadBuffers(): Promise<void> {
    const names = (Object.keys(SOUNDS) as SoundName[]).filter((name) => !definitionOf(name).stream)
    await Promise.all(names.map((name) => this.preload(name)))
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
    this.applyMusicLevel(MUSIC_DUCK_ATTACK)
    let isReleased = false
    return () => {
      if (isReleased) return
      isReleased = true
      this.ducks--
      this.applyMusicLevel(MUSIC_DUCK_RELEASE)
    }
  }

  silenceMusic(fadeSeconds: number): (restoreSeconds: number) => void {
    this.silences++
    this.applyMusicLevel(fadeSeconds)
    let isReleased = false
    return (restoreSeconds) => {
      if (isReleased) return
      isReleased = true
      this.silences--
      this.applyMusicLevel(restoreSeconds)
    }
  }

  private applyMusicLevel(seconds: number): void {
    const level = this.silences > 0 ? 0 : this.ducks > 0 ? MUSIC_DUCK : 1
    this.setChannelVolume('music', CHANNEL_VOLUMES.music * level, seconds)
  }

  setMuted(isMuted: boolean): void {
    if (!this.graph) return
    const volume = isMuted ? 0 : MASTER_VOLUME
    this.graph.master.gain.setTargetAtTime(volume, this.graph.context.currentTime, MUTE_SMOOTHING)
  }

  setVisitorVolume(channel: Channel, volume: number): void {
    if (!this.graph) return
    const { gain } = this.graph.visitorGains[channel]
    gain.setTargetAtTime(volume, this.graph.context.currentTime, MUTE_SMOOTHING)
  }

  setChannelVolume(channel: Channel, volume: number, seconds = DEFAULT_FADE): void {
    if (!this.graph) return
    const { gain } = this.graph.channels[channel]
    const now = this.graph.context.currentTime
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(gain.value, now)
    gain.linearRampToValueAtTime(volume, now + seconds)
  }

  private start(handle: SoundHandle, name: SoundName, buffer: AudioBuffer, options: PlayOptions) {
    if (!handle.active || !this.graph) return
    const { context, channels } = this.graph
    const definition = definitionOf(name)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = options.rate ?? 1

    let offset = definition.hasLeadIn ? audibleRangeOf(buffer).start : 0
    if (options.loop) {
      const range = audibleRangeOf(buffer)
      source.loop = true
      source.loopStart = range.start
      source.loopEnd = range.end
      offset = range.start
    }

    const envelope = createEnvelope(context, name, options)
    source.connect(envelope).connect(channels[definition.channel])
    source.addEventListener('ended', () => handle.finish())
    source.start(context.currentTime, offset)
    handle.attach(context, envelope, definition.volume, (at) => source.stop(at))
  }

  private startStream(handle: SoundHandle, name: SoundName, options: PlayOptions) {
    if (!handle.active || !this.graph) return
    const { context, channels, streams } = this.graph
    const definition = definitionOf(name)
    const envelope = createEnvelope(context, name, options)
    envelope.connect(channels[definition.channel])
    streams.start({ handle, name, definition, envelope, loop: options.loop, rate: options.rate })
  }

  private load(name: SoundName): Promise<AudioBuffer> {
    const known = this.buffers.get(name)
    if (known) return known
    const graph = this.graph
    if (!graph) return Promise.reject(new Error('Audio is not installed'))

    const definition = definitionOf(name)
    const source = preferredSource(definition)
    const buffer = decodeSource(graph.context, source).catch((error: unknown) => {
      if (!definition.fallback || definition.fallback === source) throw error
      console.warn(`Falling back to "${definition.fallback}"`, error)
      return decodeSource(graph.context, definition.fallback)
    })
    this.buffers.set(name, buffer)
    return buffer
  }

  private readyStreamPlayers = (): void => {
    for (const event of GESTURE_EVENTS) {
      window.removeEventListener(event, this.readyStreamPlayers, true)
    }
    this.graph?.streams.prepare()
  }

  private startPending = (): void => {
    for (const start of this.pending.splice(0)) start()
  }

  private unlock = (): void => {
    if (!this.graph || (this.unlocked && this.ready)) return
    this.graph.context
      .resume()
      .then(() => {
        this.unlocked = true
        this.startPending()
      })
      .catch(warnResumeFailed)
  }

  private syncVisibility = (): void => {
    if (!this.graph || !this.unlocked) return
    const { context } = this.graph
    if (document.hidden) void context.suspend()
    else context.resume().then(this.startPending).catch(warnResumeFailed)
  }
}

export const audio = new AudioManager()

import type { SoundHandle } from './soundHandle'
import { preferredSource } from './soundSources'
import type { SoundDefinition } from './sounds'
import { toMilliseconds } from '@/utils/time'

interface StreamPlayer {
  element: HTMLAudioElement
  source: MediaElementAudioSourceNode
}

interface StreamRequest {
  handle: SoundHandle
  name: string
  definition: SoundDefinition
  envelope: GainNode
  loop?: boolean
  rate?: number
}

const READY_PLAYERS = 4

export class StreamPlayers {
  private readonly context: AudioContext
  private idlePlayers: StreamPlayer[] = []

  constructor(context: AudioContext) {
    this.context = context
  }

  private createPlayer(): StreamPlayer {
    const element = new Audio()
    return { element, source: this.context.createMediaElementSource(element) }
  }

  prepare(): void {
    while (this.idlePlayers.length < READY_PLAYERS) this.idlePlayers.push(this.createPlayer())
    for (const { element } of this.idlePlayers) element.load()
  }

  start({ handle, name, definition, envelope, loop, rate }: StreamRequest): void {
    const { context } = this
    const player = this.idlePlayers.pop() ?? this.createPlayer()
    const { element, source } = player
    element.src = preferredSource(definition)
    element.loop = loop ?? false
    element.playbackRate = rate ?? 1
    source.connect(envelope)

    const listening = new AbortController()
    let isReleased = false
    const release = () => {
      if (isReleased) return
      isReleased = true
      listening.abort()
      element.pause()
      element.removeAttribute('src')
      element.load()
      source.disconnect()
      this.idlePlayers.push(player)
    }
    element.addEventListener(
      'ended',
      () => {
        handle.finish()
        release()
      },
      { signal: listening.signal }
    )

    let hasSwapped = false
    const startPlaying = () => {
      element.play().catch((error: unknown) => {
        if (swapToFallback()) return
        handle.stop(0)
        release()
        console.warn(`Could not stream sound "${name}"`, error)
      })
    }
    const swapToFallback = (): boolean => {
      if (hasSwapped || !definition.fallback || element.src.endsWith(definition.fallback)) {
        return false
      }
      hasSwapped = true
      console.warn(`Falling back to "${definition.fallback}" for "${name}"`)
      element.src = definition.fallback
      element.load()
      startPlaying()
      return true
    }
    element.addEventListener(
      'error',
      () => {
        if (handle.active) swapToFallback()
      },
      { signal: listening.signal }
    )
    startPlaying()
    handle.attach(context, envelope, definition.volume, (at) => {
      window.setTimeout(release, Math.max(0, toMilliseconds(at - context.currentTime)))
    })
  }
}

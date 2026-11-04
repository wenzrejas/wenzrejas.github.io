import { create } from 'zustand'
import type { WeatherType } from './weatherStore'

export type NightEventKind = 'none' | 'lanterns' | 'jellyfish'

interface NightEventState {
  kind: NightEventKind
  isForced: boolean
  run: number
}

export const useNightEventStore = create<NightEventState>(() => ({
  kind: 'none',
  isForced: false,
  run: 0,
}))

export const isNightEventOn = () => useNightEventStore.getState().kind !== 'none'

export const spoilsNightEvent = (weather: WeatherType) =>
  weather === 'moonlit' || weather === 'rainy'

export const beginNightEvent = (kind: NightEventKind) =>
  useNightEventStore.setState(({ run }) => ({ kind, isForced: false, run: run + 1 }))

export const forceNightEvent = (kind: NightEventKind) =>
  useNightEventStore.setState(({ run }) => ({ kind, isForced: true, run: run + 1 }))

export const endNightEvent = () => useNightEventStore.setState({ kind: 'none', isForced: false })

import { create } from 'zustand'
import { useCinematicStore } from './cinematicStore'

interface SkyBeamState {
  isActive: boolean
  presence: number
  darkness: number
  flash: number
}

export const useSkyBeamStore = create<SkyBeamState>(() => ({
  isActive: false,
  presence: 0,
  darkness: 0,
  flash: 0,
}))

export function startSkyBeam() {
  if (useSkyBeamStore.getState().isActive) return
  useCinematicStore.getState().isPlaying = true
  useSkyBeamStore.setState({ isActive: true })
}

export const endSkyBeam = () => useSkyBeamStore.setState({ isActive: false })

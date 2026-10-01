import { create } from 'zustand'

interface SkyBeamState {
  isActive: boolean
  presence: number
  darkness: number
}

export const useSkyBeamStore = create<SkyBeamState>(() => ({
  isActive: false,
  presence: 0,
  darkness: 0,
}))

export function startSkyBeam() {
  if (!useSkyBeamStore.getState().isActive) useSkyBeamStore.setState({ isActive: true })
}

export const endSkyBeam = () => useSkyBeamStore.setState({ isActive: false })

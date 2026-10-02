import { create } from 'zustand'

interface HudState {
  isHudVisible: boolean
  isSoundOn: boolean
}

export const useHudStore = create<HudState>(() => ({
  isHudVisible: true,
  isSoundOn: true,
}))

export const toggleHud = () =>
  useHudStore.setState((state) => ({ isHudVisible: !state.isHudVisible }))

export const toggleSound = () => useHudStore.setState((state) => ({ isSoundOn: !state.isSoundOn }))

import { create } from 'zustand'
import type { IslandKey } from '../components/World/Islands/constants'

interface UIState {
  selectedIsland: IslandKey | null
  selectIsland: (key: IslandKey) => void
  clearIsland: () => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedIsland: null,
  selectIsland: (key) => set({ selectedIsland: key }),
  clearIsland: () => set({ selectedIsland: null }),
}))

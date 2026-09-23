import { create } from 'zustand'

interface WhaleState {
  active: boolean
  x: number
  z: number
  radius: number
}

export const useWhaleStore = create<WhaleState>(() => ({
  active: false,
  x: 0,
  z: 0,
  radius: 0,
}))

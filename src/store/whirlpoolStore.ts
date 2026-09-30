import { create } from 'zustand'

interface WhirlpoolState {
  active: boolean
  x: number
  z: number
  radius: number
  depth: number
  curve: number
  twist: number
  drainRate: number
}

export const useWhirlpoolStore = create<WhirlpoolState>(() => ({
  active: false,
  x: 0,
  z: 0,
  radius: 0,
  depth: 0,
  curve: 1,
  twist: 0,
  drainRate: 0,
}))

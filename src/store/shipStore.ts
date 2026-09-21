import { create } from 'zustand'

interface ShipState {
  x: number
  z: number
  vx: number
  vz: number
  speed: number
  heading: number
}

export const useShipStore = create<ShipState>(() => ({
  x: 0,
  z: 0,
  vx: 0,
  vz: 0,
  speed: 0,
  heading: 0,
}))

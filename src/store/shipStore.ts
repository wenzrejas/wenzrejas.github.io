import { create } from 'zustand'
import { INITIAL_HEADING } from '../world/ship/constants'

interface ShipState {
  x: number
  z: number
  vx: number
  vz: number
  speed: number
  heading: number
}

export const SPAWN_HEADING = INITIAL_HEADING + Math.PI

export const useShipStore = create<ShipState>(() => ({
  x: 0,
  z: 0,
  vx: 0,
  vz: 0,
  speed: 0,
  heading: SPAWN_HEADING,
}))

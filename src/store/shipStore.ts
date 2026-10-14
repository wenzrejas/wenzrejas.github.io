import { create } from 'zustand'
import { INITIAL_HEADING } from '../world/ship/constants'

interface ShipState {
  x: number
  z: number
  vx: number
  vz: number
  speed: number
  heading: number
  tailwind: number
  placements: number
}

export const SPAWN_HEADING = INITIAL_HEADING + Math.PI

export const useShipStore = create<ShipState>(() => ({
  x: 0,
  z: 0,
  vx: 0,
  vz: 0,
  speed: 0,
  heading: SPAWN_HEADING,
  tailwind: 0,
  placements: 0,
}))

export function placeShip(x: number, z: number, heading: number) {
  useShipStore.setState(({ placements }) => ({
    x,
    z,
    heading,
    vx: 0,
    vz: 0,
    speed: 0,
    placements: placements + 1,
  }))
}

export const onShipPlaced = (listener: (ship: ShipState) => void) =>
  useShipStore.subscribe((ship, previous) => {
    if (ship.placements !== previous.placements) listener(ship)
  })

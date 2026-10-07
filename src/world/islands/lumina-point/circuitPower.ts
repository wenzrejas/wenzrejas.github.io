import * as THREE from 'three'
import {
  CIRCUIT_GLOW_SECONDS,
  CIRCUIT_RELEASE_RATE,
  CIRCUIT_TRAVEL_DELAY,
  CIRCUIT_TRAVEL_SECONDS,
  MONOLITH_GLOW_SECONDS,
} from './constants'

export interface CircuitPower {
  poweredSeconds: number
  glow: number
  front: number
  arrival: number
}

const { clamp, smoothstep } = THREE.MathUtils

const ARRIVAL_SECONDS = CIRCUIT_TRAVEL_DELAY + CIRCUIT_TRAVEL_SECONDS
const FULL_POWER_SECONDS = ARRIVAL_SECONDS + MONOLITH_GLOW_SECONDS

export const createCircuitPower = (): CircuitPower => ({
  poweredSeconds: 0,
  glow: 0,
  front: 0,
  arrival: 0,
})

export function powerCircuit(power: CircuitPower, isPowering: boolean, dt: number) {
  const step = isPowering ? dt : -dt * CIRCUIT_RELEASE_RATE
  power.poweredSeconds = clamp(power.poweredSeconds + step, 0, FULL_POWER_SECONDS)
  power.glow = smoothstep(power.poweredSeconds, 0, CIRCUIT_GLOW_SECONDS)
  const travel = clamp((power.poweredSeconds - CIRCUIT_TRAVEL_DELAY) / CIRCUIT_TRAVEL_SECONDS, 0, 1)
  power.front = 1 - (1 - travel) ** 2
  power.arrival = smoothstep(power.poweredSeconds, ARRIVAL_SECONDS, FULL_POWER_SECONDS)
}

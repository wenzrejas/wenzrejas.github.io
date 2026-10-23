import * as THREE from 'three'
import { markDepthsRevealed } from '@/store/depthsStore'
import { DARKNESS_FADE_SECONDS, PLUNGE_DELAY_SECONDS, PLUNGE_SECONDS } from './constants'

export interface Arrival {
  seconds: number
}

const PLUNGE_END = PLUNGE_DELAY_SECONDS + PLUNGE_SECONDS
const ARRIVAL_END = PLUNGE_END + DARKNESS_FADE_SECONDS

export const createArrival = (): Arrival => ({ seconds: 0 })

export function advanceArrival(arrival: Arrival, dt: number, isInDepths: boolean) {
  if (!isInDepths || arrival.seconds >= ARRIVAL_END) return
  arrival.seconds = Math.min(arrival.seconds + dt, ARRIVAL_END)
  if (arrival.seconds === ARRIVAL_END) markDepthsRevealed()
}

export const plungeShare = ({ seconds }: Arrival) =>
  THREE.MathUtils.clamp((seconds - PLUNGE_DELAY_SECONDS) / PLUNGE_SECONDS, 0, 1)

export const plungeSeconds = ({ seconds }: Arrival) => Math.max(seconds - PLUNGE_DELAY_SECONDS, 0)

export const darknessLevel = ({ seconds }: Arrival) =>
  1 - THREE.MathUtils.smoothstep(seconds, PLUNGE_END, ARRIVAL_END)

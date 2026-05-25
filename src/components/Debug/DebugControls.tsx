import { createContext, useContext, type ReactNode } from 'react'
import { useControls, folder } from 'leva'
import { OCEAN_DEFAULTS } from '../Ocean/constants'
import {
  BASE_Y,
  BOB_AMP,
  BOB_SPEED,
  MOVE_SPEED,
  TURN_SPEED,
  TILT_MAX,
  TILT_SPEED,
  PARTICLE_LIFETIME,
  PARTICLE_SPEED,
} from '../Ship/constants'

export interface OceanControls {
  waveAmp: number
  waveSpeed: number
  waterScale: number
  cellSmoothness: number
  edgeThreshold: number
  edgeSoftness: number
  cellSpeed: number
  flowX: number
  flowZ: number
  noiseScale: number
  noiseFlowSpeed: number
  distortAmount: number
  deepColor: string
  midColor: string
  midPos: number
  highlightColor: string
  opacity: number
  deepOpacity: number
  fresnelPower: number
  fresnelStrength: number
  foamAmount: number
}

export interface ShipControls {
  moveSpeed: number
  turnSpeed: number
  baseY: number
  bobAmp: number
  bobSpeed: number
  tiltMax: number
  tiltSpeed: number
  partLife: number
  partSpeed: number
}

interface DebugContextValue {
  ocean: OceanControls
  ship: ShipControls
}

const DebugContext = createContext<DebugContextValue>(null!)

export function DebugProvider({ children }: { children: ReactNode }) {
  const ocean = useControls(
    'Ocean',
    {
      Wave: folder({
        waveAmp: { value: OCEAN_DEFAULTS.waveAmp, min: 0, max: 15, step: 0.1 },
        waveSpeed: { value: OCEAN_DEFAULTS.waveSpeed, min: 0, max: 5, step: 0.05 },
      }),
      Cell: folder({
        waterScale: { value: OCEAN_DEFAULTS.waterScale, min: 0.01, max: 1, step: 0.01 },
        cellSmoothness: { value: OCEAN_DEFAULTS.cellSmoothness, min: 0, max: 1, step: 0.01 },
        edgeThreshold: { value: OCEAN_DEFAULTS.edgeThreshold, min: 0, max: 0.5, step: 0.005 },
        edgeSoftness: { value: OCEAN_DEFAULTS.edgeSoftness, min: 0, max: 0.3, step: 0.005 },
        cellSpeed: { value: OCEAN_DEFAULTS.cellSpeed, min: 0, max: 3, step: 0.05 },
      }),
      Flow: folder({
        flowX: { value: OCEAN_DEFAULTS.flowX, min: -1, max: 1, step: 0.01 },
        flowZ: { value: OCEAN_DEFAULTS.flowZ, min: -1, max: 1, step: 0.01 },
        noiseScale: { value: OCEAN_DEFAULTS.noiseScale, min: 0.1, max: 5, step: 0.01 },
        noiseFlowSpeed: { value: OCEAN_DEFAULTS.noiseFlowSpeed, min: 0, max: 2, step: 0.01 },
        distortAmount: { value: OCEAN_DEFAULTS.distortAmount, min: 0, max: 1, step: 0.01 },
      }),
      Color: folder({
        deepColor: { value: OCEAN_DEFAULTS.deepColor },
        midColor: { value: OCEAN_DEFAULTS.midColor },
        midPos: { value: OCEAN_DEFAULTS.midPos, min: 0, max: 1, step: 0.01 },
        highlightColor: { value: OCEAN_DEFAULTS.highlightColor },
        opacity: { value: OCEAN_DEFAULTS.opacity, min: 0, max: 1, step: 0.01 },
        deepOpacity: { value: OCEAN_DEFAULTS.deepOpacity, min: 0, max: 1, step: 0.01 },
      }),
      Fresnel: folder({
        fresnelPower: { value: OCEAN_DEFAULTS.fresnelPower, min: 0, max: 10, step: 0.1 },
        fresnelStrength: { value: OCEAN_DEFAULTS.fresnelStrength, min: 0, max: 1, step: 0.01 },
      }),
      foamAmount: { value: OCEAN_DEFAULTS.foamAmount, min: 0, max: 1, step: 0.01 },
    },
    { collapsed: true }
  ) as OceanControls

  const ship = useControls(
    'Ship',
    {
      Movement: folder({
        moveSpeed: { value: MOVE_SPEED, min: 0, max: 150, step: 1 },
        turnSpeed: { value: TURN_SPEED, min: 0, max: 3, step: 0.01 },
      }),
      Bob: folder({
        baseY: { value: BASE_Y, min: 0, max: 10, step: 0.1 },
        bobAmp: { value: BOB_AMP, min: 0, max: 5, step: 0.1 },
        bobSpeed: { value: BOB_SPEED, min: 0, max: 5, step: 0.1 },
      }),
      Tilt: folder({
        tiltMax: { value: TILT_MAX, min: 0, max: 0.5, step: 0.01 },
        tiltSpeed: { value: TILT_SPEED, min: 0, max: 20, step: 0.5 },
      }),
      Ripple: folder({
        partLife: { value: PARTICLE_LIFETIME, min: 0.1, max: 5, step: 0.1 },
        partSpeed: { value: PARTICLE_SPEED, min: 0, max: 30, step: 1 },
      }),
    },
    { collapsed: true }
  ) as ShipControls

  return <DebugContext.Provider value={{ ocean, ship }}>{children}</DebugContext.Provider>
}

export function useDebug() {
  return useContext(DebugContext)
}

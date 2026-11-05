import { create } from 'zustand'
import * as THREE from 'three'
import {
  INITIAL_MOON_POSITION,
  INITIAL_SUN_POSITION,
  STARTING_CYCLE_TIME,
} from '@/world/environment/day-night-cycle/constants'

interface CycleState {
  fogColor: THREE.Color
  oceanDeep: THREE.Color
  oceanMid: THREE.Color
  oceanSunDirection: THREE.Vector3
  clockSunHeight: number
  oceanMoonDirection: THREE.Vector3
  foamColor: THREE.Color
  sparkleColor: THREE.Color
  nightFactor: number
  timeOfDay: number
  fresnel: number
  specular: number
}

const INITIAL_SUN_DIRECTION = new THREE.Vector3(...INITIAL_SUN_POSITION).normalize()

export const useCycleStore = create<CycleState>(() => ({
  fogColor: new THREE.Color('#c8dff0'),
  oceanDeep: new THREE.Color('#27a3d8'),
  oceanMid: new THREE.Color('#59c0e8'),
  oceanSunDirection: INITIAL_SUN_DIRECTION.clone(),
  clockSunHeight: INITIAL_SUN_DIRECTION.y,
  oceanMoonDirection: new THREE.Vector3(...INITIAL_MOON_POSITION).normalize(),
  foamColor: new THREE.Color('#ffffff'),
  sparkleColor: new THREE.Color('#fff1d0'),
  nightFactor: 0,
  timeOfDay: STARTING_CYCLE_TIME,
  fresnel: 1,
  specular: 1,
}))

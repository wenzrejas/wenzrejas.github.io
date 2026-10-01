import { create } from 'zustand'
import * as THREE from 'three'

interface CycleState {
  fogColor: THREE.Color
  oceanDeep: THREE.Color
  oceanMid: THREE.Color
  oceanSunDir: THREE.Vector3
  clockSunHeight: number
  oceanMoonDir: THREE.Vector3
  foamColor: THREE.Color
  nightFactor: number
  timeOfDay: number
  fresnel: number
  specular: number
}

const INITIAL_SUN_DIRECTION = new THREE.Vector3(2.5, 3.5, 0).normalize()

export const useCycleStore = create<CycleState>(() => ({
  fogColor: new THREE.Color('#c8dff0'),
  oceanDeep: new THREE.Color('#27a3d8'),
  oceanMid: new THREE.Color('#59c0e8'),
  oceanSunDir: INITIAL_SUN_DIRECTION.clone(),
  clockSunHeight: INITIAL_SUN_DIRECTION.y,
  oceanMoonDir: new THREE.Vector3(5, 80, 5).normalize(),
  foamColor: new THREE.Color('#ffffff'),
  nightFactor: 0,
  timeOfDay: 0.28,
  fresnel: 1,
  specular: 1,
}))

import { create } from 'zustand'
import * as THREE from 'three'

interface CycleState {
  fogColor: THREE.Color
  oceanDeep: THREE.Color
  oceanMid: THREE.Color
  oceanSunDir: THREE.Vector3
  oceanMoonDir: THREE.Vector3
  foamColor: THREE.Color
  nightFactor: number
}

// THREE.Color / Vector3 objects are mutated in-place each frame by DayNightCycle.
// Readers access them via getState() in useFrame — no React subscriptions needed.
export const useCycleStore = create<CycleState>(() => ({
  fogColor: new THREE.Color('#c8dff0'),
  oceanDeep: new THREE.Color('#27a3d8'),
  oceanMid: new THREE.Color('#59c0e8'),
  oceanSunDir: new THREE.Vector3(2.5, 3.5, 0).normalize(),
  oceanMoonDir: new THREE.Vector3(5, 80, 5).normalize(),
  foamColor: new THREE.Color('#ffffff'),
  nightFactor: 0,
}))

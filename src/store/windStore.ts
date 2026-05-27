import { create } from 'zustand'
import * as THREE from 'three'

const initialAngle = Math.random() * Math.PI * 2

interface WindState {
  angle: number
  dir: THREE.Vector2
}

// dir is mutated in-place each frame by WindLines — readers use getState() in useFrame.
export const useWindStore = create<WindState>(() => ({
  angle: initialAngle,
  dir: new THREE.Vector2(Math.cos(initialAngle), -Math.sin(initialAngle)),
}))

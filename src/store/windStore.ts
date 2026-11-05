import { create } from 'zustand'
import * as THREE from 'three'

const initialAngle = Math.random() * Math.PI * 2

interface WindState {
  angle: number
  direction: THREE.Vector2
}

export const useWindStore = create<WindState>(() => ({
  angle: initialAngle,
  direction: new THREE.Vector2(Math.cos(initialAngle), -Math.sin(initialAngle)),
}))

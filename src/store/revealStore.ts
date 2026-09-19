import { create } from 'zustand'
import * as THREE from 'three'
import type { IslandKey } from '../components/World/Islands/constants'

interface RevealState {
  blend: number
  target: THREE.Vector3
  activeKey: IslandKey | null
}

export const useRevealStore = create<RevealState>(() => ({
  blend: 0,
  target: new THREE.Vector3(),
  activeKey: null,
}))

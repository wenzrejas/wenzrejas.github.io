import { create } from 'zustand'
import * as THREE from 'three'
import type { IslandKey } from '../world/islands/shared/constants'

interface RevealState {
  blend: number
  target: THREE.Vector3
  islandScreenTop: number | null
  activeKey: IslandKey | null
  nearbyIsland: IslandKey | null
}

export const useRevealStore = create<RevealState>(() => ({
  blend: 0,
  target: new THREE.Vector3(),
  islandScreenTop: null,
  activeKey: null,
  nearbyIsland: null,
}))

export const isRevealPlaying = () => useRevealStore.getState().activeKey !== null

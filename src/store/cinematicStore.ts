import { create } from 'zustand'
import * as THREE from 'three'
import { isLoaderShowing } from './loadingStore'

interface CinematicState {
  isPlaying: boolean
  focus: THREE.Vector3
  focusBlend: number
  focusZoom: number
  shake: number
}

export const useCinematicStore = create<CinematicState>(() => ({
  isPlaying: false,
  focus: new THREE.Vector3(),
  focusBlend: 0,
  focusZoom: 1,
  shake: 0,
}))

export const isCinematicPlaying = () => useCinematicStore.getState().isPlaying

export const eventDelta = (dt: number) => (isCinematicPlaying() || isLoaderShowing() ? 0 : dt)

import { create } from 'zustand'
import * as THREE from 'three'
import { isIntroductionPending } from './guideStore'

interface CinematicState {
  isPlaying: boolean
  isShipReleased: boolean
  focus: THREE.Vector3
  focusBlend: number
  focusZoom: number
  shake: number
  spin: number
}

export const useCinematicStore = create<CinematicState>(() => ({
  isPlaying: false,
  isShipReleased: false,
  focus: new THREE.Vector3(),
  focusBlend: 0,
  focusZoom: 1,
  shake: 0,
  spin: 0,
}))

export const isCinematicPlaying = () => useCinematicStore.getState().isPlaying

export const isShipReleased = () => useCinematicStore.getState().isShipReleased

export const eventDelta = (dt: number) => (isCinematicPlaying() || isIntroductionPending() ? 0 : dt)

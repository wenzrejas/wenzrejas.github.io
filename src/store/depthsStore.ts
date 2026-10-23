import { create } from 'zustand'
import type * as THREE from 'three'
import type { Timeline } from '@/depths/scene/timeline/timeline'

type SurfacingStyle = 'ascent' | 'rewind'

interface DepthsState {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  timeline: Timeline | null
  isReady: boolean
  isRevealed: boolean
  isShipLanded: boolean
  hasFailed: boolean
  surfacingStyle: SurfacingStyle
}

export const useDepthsStore = create<DepthsState>(() => ({
  scene: null,
  camera: null,
  timeline: null,
  isReady: false,
  isRevealed: false,
  isShipLanded: false,
  hasFailed: false,
  surfacingStyle: 'ascent',
}))

export const showDepthsStage = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  timeline: Timeline
) =>
  useDepthsStore.setState({
    scene,
    camera,
    timeline,
    isReady: false,
    isRevealed: false,
    isShipLanded: false,
    surfacingStyle: 'ascent',
  })

export const markDepthsReady = () => useDepthsStore.setState({ isReady: true })

export const chooseRewind = () => useDepthsStore.setState({ surfacingStyle: 'rewind' })

export const isRewindChosen = () => useDepthsStore.getState().surfacingStyle === 'rewind'

export const markDepthsRevealed = () => useDepthsStore.setState({ isRevealed: true })

export const setShipLanded = (isShipLanded: boolean) =>
  useDepthsStore.setState((state) =>
    state.isShipLanded === isShipLanded ? state : { isShipLanded }
  )

export const failDepths = () => useDepthsStore.setState({ hasFailed: true })

export const clearDepthsStage = () =>
  useDepthsStore.setState({
    scene: null,
    camera: null,
    timeline: null,
    isReady: false,
    isRevealed: false,
    isShipLanded: false,
  })

export const resetDepthsLoad = () => useDepthsStore.setState({ hasFailed: false })

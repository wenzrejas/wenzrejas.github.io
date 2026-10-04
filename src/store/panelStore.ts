import { create } from 'zustand'
import * as THREE from 'three'

export type GroveKey = 'frontend' | 'creative' | 'visuals' | 'design'
export type PanelKey = 'contact' | 'support' | GroveKey

interface PanelState {
  activePanel: PanelKey | null
  focus: THREE.Vector3
  focusOffsetPixels: number
}

export const usePanelStore = create<PanelState>(() => ({
  activePanel: null,
  focus: new THREE.Vector3(),
  focusOffsetPixels: 0,
}))

export function openPanel(key: PanelKey, focus: THREE.Vector3) {
  usePanelStore.getState().focus.copy(focus)
  usePanelStore.setState({ activePanel: key })
}

export const closePanel = () => usePanelStore.setState({ activePanel: null })

export function centerFocusLeftOf(panelLeftPixels: number) {
  usePanelStore.getState().focusOffsetPixels = panelLeftPixels / 2 - window.innerWidth / 2
}

export const isPanelOpen = () => usePanelStore.getState().activePanel !== null

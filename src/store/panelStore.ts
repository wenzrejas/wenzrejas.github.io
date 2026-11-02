import { create } from 'zustand'
import * as THREE from 'three'
import { isSheetLayout, useSheetLayout } from '@/utils/layout'

export type GroveKey = 'frontend' | 'creative' | 'visuals' | 'design'
export type ProjectKey =
  | 'beeSigned'
  | 'chooChooChain'
  | 'paymentsManager'
  | 'uiuxWorks'
  | 'gelify'
  | 'qoves'
export type IslandPanelKey = 'contact' | 'support' | 'settings' | GroveKey | ProjectKey
export type PanelKey = IslandPanelKey | 'bottle'

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

export const openSettings = () => usePanelStore.setState({ activePanel: 'settings' })

export const openBottleNote = () => usePanelStore.setState({ activePanel: 'bottle' })

export const closePanel = () => usePanelStore.setState({ activePanel: null })

export function centerFocusLeftOf(panelLeftPixels: number) {
  usePanelStore.getState().focusOffsetPixels = isSheetLayout()
    ? 0
    : panelLeftPixels / 2 - window.innerWidth / 2
}

export const isPanelOpen = () => usePanelStore.getState().activePanel !== null

export function useIsPanelCoveringScreen() {
  const isSheet = useSheetLayout()
  const isOpen = usePanelStore(
    (state) => state.activePanel !== null && state.activePanel !== 'bottle'
  )
  return isSheet && isOpen
}

export function isFocusedPanelOpen() {
  const { activePanel } = usePanelStore.getState()
  return activePanel !== null && activePanel !== 'settings' && activePanel !== 'bottle'
}

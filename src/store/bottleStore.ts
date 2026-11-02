import { create } from 'zustand'
import * as THREE from 'three'
import { IS_DEBUG } from '@/app/experience/constants'
import {
  ALL_BOTTLES,
  type BottleKey,
  type BottlePanel,
} from '@/minigames/message-in-a-bottle/bottleSpots'
import { openBottleNote, openPanel } from './panelStore'
import { useShipStore } from './shipStore'
import { rememberedItems, rememberItem } from './visitorMemory'

interface BottleState {
  found: BottleKey[]
  openNote: BottleKey | null
}

export const useBottleStore = create<BottleState>(() => ({
  found: rememberedItems('foundBottles', ALL_BOTTLES),
  openNote: null,
}))

export function useBottlesInSettings(): readonly BottleKey[] {
  const found = useBottleStore((state) => state.found)
  return IS_DEBUG ? ALL_BOTTLES : found
}

export function findBottle(bottle: BottleKey) {
  rememberItem('foundBottles', bottle)
  useBottleStore.setState(({ found }) => ({ found: [...found, bottle], openNote: bottle }))
  openBottleNote()
}

export function openBottlePanel(panel: BottlePanel) {
  const { x, z } = useShipStore.getState()
  openPanel(panel, new THREE.Vector3(x, 0, z))
}

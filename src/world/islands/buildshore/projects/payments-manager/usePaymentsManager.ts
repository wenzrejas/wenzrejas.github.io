import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { dressContactlessIcon, lightContactlessArcs } from './contactlessIconModel'
import { dressTerminalScreen, updateTerminalScreen } from './terminalScreenModel'
import { checkLevel, checkStroke, findTerminal, poseTerminal } from './terminalTap'

export function usePaymentsManager(model: THREE.Object3D, hover: HoverTimeline) {
  const terminal = useMemo(() => findTerminal(model), [model])
  const screen = useMemo(() => (terminal ? dressTerminalScreen(terminal.screen) : null), [terminal])
  const arcs = useMemo(() => (terminal ? dressContactlessIcon(terminal.icon) : null), [terminal])

  useFrame(() => {
    if (!terminal || !screen) return
    poseTerminal(terminal, hover)
    updateTerminalScreen(screen, checkLevel(hover), checkStroke(hover))
    if (arcs) lightContactlessArcs(arcs, hover.engagedSeconds, hover.presence)
  })
}

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { timelineStage, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { nightGlow } from '@/world/islands/shared/nightGlow'
import { STATION_WINDOW_HOVER_GLOW, STATION_WINDOW_RISE_SECONDS } from './constants'
import { lightStationWindows, prepareStationWindows } from './stationWindows'

export function useChooChooChain(model: THREE.Object3D, hover: HoverTimeline) {
  const windows = useMemo(() => prepareStationWindows(model), [model])

  useFrame(() => {
    if (!windows) return
    lightStationWindows(
      windows,
      nightGlow() + STATION_WINDOW_HOVER_GLOW * timelineStage(hover, STATION_WINDOW_RISE_SECONDS)
    )
  })
}

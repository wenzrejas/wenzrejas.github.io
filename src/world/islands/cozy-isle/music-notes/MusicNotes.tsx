import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { uniformsOf } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import type { HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import { RENDER_LAYER } from '@/app/experience/renderLayers'
import { pixelsPerUnit } from '@/utils/screen'
import { isBreakEngaged } from '../cafeBreak'
import { NOTE_SIZE } from './constants'
import { createMelody, hasNotesInFlight, stepMelody } from './melody'
import { buildNoteGeometry, createNoteMaterial, paintNoteAtlas } from './musicNoteModel'

interface MusicNotesProps {
  spot: THREE.Vector3
  islandScale: number
  cafeBreak: HoverTimeline
}

export default function MusicNotes({ spot, islandScale, cafeBreak }: MusicNotesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const melody = useRef(createMelody())

  const atlas = useMemo(() => paintNoteAtlas(), [])
  const geometry = useMemo(() => buildNoteGeometry(), [])
  const material = useMemo(() => createNoteMaterial(atlas), [atlas])

  useEffect(
    () => () => {
      atlas.dispose()
      geometry.dispose()
      material.dispose()
    },
    [atlas, geometry, material]
  )

  useFrame(({ camera, gl }, delta) => {
    const points = pointsRef.current
    if (!points) return

    stepMelody(melody.current, isBreakEngaged(cafeBreak), Math.min(delta, MAX_FRAME_SECONDS))
    points.visible = hasNotesInFlight(melody.current)
    if (!points.visible) return

    const uniforms = uniformsOf(points)

    uniforms.uSeconds.value = melody.current.seconds
    uniforms.uLastLaunch.value = melody.current.lastLaunchSeconds
    uniforms.uSize.value = NOTE_SIZE * islandScale * pixelsPerUnit(camera, gl)
  })

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      position={spot}
      visible={false}
      renderOrder={RENDER_LAYER.overGlow}
    />
  )
}

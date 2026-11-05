import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { CHECKPOINT_RUN_COPY } from '@/data/minigameCopy'
import InteractionMarker from '@/interaction/InteractionMarker'
import { openPrompt, useCheckpointStore } from '@/store/checkpointStore'
import { useCycleStore } from '@/store/cycleStore'
import { buoyOf } from './checkpointRun'
import { START_MARKER_HEIGHT, START_MARKER_PIXELS } from './constants'
import { buildBuoyKit, disposeBuoyKit } from './courseModel'
import { COURSE_KEYS, type CourseKey } from './courses'

const copy = CHECKPOINT_RUN_COPY

function StartMarker({ course, bodyHit }: { course: CourseKey; bodyHit: THREE.BufferGeometry }) {
  const best = useCheckpointStore((state) => state.bests[course])
  const { x, z } = buoyOf(course)
  return (
    <InteractionMarker
      position={[x, START_MARKER_HEIGHT, z]}
      label={copy.courses[course]}
      description={best === undefined ? copy.startHint : copy.startBest(best)}
      pixels={START_MARKER_PIXELS}
      bodyHit={bodyHit}
      onActivate={() => openPrompt(course)}
    />
  )
}

export default function CourseBuoys() {
  const kit = useMemo(() => buildBuoyKit(), [])

  useEffect(() => () => disposeBuoyKit(kit), [kit])

  useFrame(() => {
    kit.materials.flag.color.copy(useCycleStore.getState().foamColor)
  })

  return COURSE_KEYS.map((course) => {
    const { x, z } = buoyOf(course)
    return (
      <group key={course}>
        <group position={[x, 0, z]}>
          <mesh geometry={kit.geometries.frame} material={kit.materials.body} />
          <mesh geometry={kit.geometries.stripe} material={kit.materials.stripe} />
          <mesh geometry={kit.geometries.lantern} material={kit.materials.lantern} />
          <mesh geometry={kit.geometries.flag} material={kit.materials.flag} />
        </group>
        <StartMarker course={course} bodyHit={kit.geometries.hit} />
      </group>
    )
  })
}

import { useEffect, useEffectEvent, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useFrame, type Vector3 } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { animated, useSpring } from '@react-spring/web'
import * as THREE from 'three'
import { isPanelOpen } from '../store/panelStore'
import { uniformsOf } from '../utils/meshes'
import {
  INTERACTION_LAYER,
  MARKER_LABEL_SLIDE,
  MARKER_LABEL_SPRING,
  MARKER_PIXELS,
  MARKER_PULSE_SECONDS,
  MARKER_RENDER_ORDER,
  MARKER_RING_OUTER,
} from './constants'
import { interactions } from './interactionManager'
import { fadeMarker, pinToScreen, springHover, type MarkerMotion } from './marker'
import { buildMarkerGeometry, createMarkerMaterial } from './markerModel'
import './InteractionMarker.scss'

interface InteractionMarkerProps {
  position: Vector3
  label: string
  onHover?: (isHovered: boolean) => void
  onActivate?: (markerSpot: THREE.Vector3) => void
  shipReach?: number
  baseGap?: (x: number, z: number) => number
}

const LABEL_REACH = { '--marker-reach': `${MARKER_PIXELS * MARKER_RING_OUTER}px` } as CSSProperties

export default function InteractionMarker({
  position,
  label,
  onHover,
  onActivate,
  shipReach,
  baseGap,
}: InteractionMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const motion = useRef<MarkerMotion>({ hover: 0, velocity: 0, presence: 1 })
  const [pulseOffset] = useState(Math.random)
  const [isHovered, setHovered] = useState(false)
  const reportHover = useEffectEvent((next: boolean) => {
    setHovered(next)
    onHover?.(next)
  })
  const activate = useEffectEvent(() => {
    const mesh = meshRef.current
    if (mesh) onActivate?.(mesh.getWorldPosition(new THREE.Vector3()))
  })

  const geometry = useMemo(() => buildMarkerGeometry(), [])
  const material = useMemo(() => createMarkerMaterial(), [])
  const { opacity, x } = useSpring({
    opacity: isHovered ? 1 : 0,
    x: isHovered ? 0 : -MARKER_LABEL_SLIDE,
    config: MARKER_LABEL_SPRING,
  })

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.layers.enable(INTERACTION_LAYER)
    return interactions.register(mesh, {
      onHover: (next) => reportHover(next),
      onActivate: () => activate(),
      shipReach,
      baseGap,
    })
  }, [shipReach, baseGap])

  useFrame(({ camera, clock }, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    fadeMarker(motion.current, !isPanelOpen(), delta)
    mesh.visible = motion.current.presence > 0
    if (!mesh.visible) return
    pinToScreen(mesh, camera, MARKER_PIXELS)
    springHover(motion.current, isHovered, delta)
    const uniforms = uniformsOf(mesh)
    uniforms.uOpacity.value = motion.current.presence
    uniforms.uHover.value = Math.max(0, motion.current.hover)
    uniforms.uPulse.value = (clock.getElapsedTime() / MARKER_PULSE_SECONDS + pulseOffset) % 1
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        renderOrder={MARKER_RENDER_ORDER}
      />
      <Html pointerEvents="none">
        <div className="interaction-marker" style={LABEL_REACH}>
          <animated.span className="interaction-marker__label" style={{ opacity, x }}>
            {label}
          </animated.span>
        </div>
      </Html>
    </group>
  )
}

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import { isHoverHeld, type HoverTimeline } from '@/world/islands/shared/hoverTimeline'
import GemSparkles from '@/world/islands/shared/gem-sparkles/GemSparkles'
import { cornerSparkleGem } from '@/world/islands/shared/gem-sparkles/sparkleSpots'
import { dayNightGlow } from '@/world/islands/shared/nightGlow'
import { findAngularBlocks, stackAngularBlocks } from './angularBlocks'
import { angularGemLevel, findAngularGem, poseAngularGem } from './angularGem'
import {
  ANGULAR_GEM_GLOW_DAY_SHARE,
  ANGULAR_GEM_GLOW_GAIN,
  ANGULAR_GEM_SPARKLES,
} from './constants'
import { editorLevel, findEditorMotion, poseEditor } from './editorMotion'
import { preparePlayhead, sweepPlayhead } from './playhead'
import { dressSapphire, glowSapphire } from './sapphireModel'

interface GelTemplateEditorProps {
  model: THREE.Object3D
  hover: HoverTimeline
  islandScale: number
}

export default function GelTemplateEditor({ model, hover, islandScale }: GelTemplateEditorProps) {
  const editor = useMemo(() => findEditorMotion(model), [model])
  const playhead = useMemo(() => preparePlayhead(model), [model])
  const blocks = useMemo(() => findAngularBlocks(model), [model])
  const gem = useMemo(() => findAngularGem(model), [model])
  const sapphire = useMemo(() => (gem ? dressSapphire(gem.mesh) : null), [gem])
  const sparkles = useMemo(
    () => (gem ? cornerSparkleGem(gem.mesh, ANGULAR_GEM_SPARKLES) : null),
    [gem]
  )

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, MAX_FRAME_SECONDS)
    const level = editorLevel(hover)
    if (editor) poseEditor(editor, level, clock.getElapsedTime(), dt)
    if (playhead) sweepPlayhead(playhead, level, dt)
    stackAngularBlocks(blocks, hover)
    if (gem) poseAngularGem(gem, isHoverHeld(hover), dt)
    if (sapphire) {
      glowSapphire(sapphire, dayNightGlow(ANGULAR_GEM_GLOW_DAY_SHARE) * ANGULAR_GEM_GLOW_GAIN)
    }
  })

  if (!gem || !sparkles) return null
  return (
    <GemSparkles
      gem={sparkles}
      tuning={ANGULAR_GEM_SPARKLES}
      size={ANGULAR_GEM_SPARKLES.size * islandScale}
      level={() => angularGemLevel(gem)}
    />
  )
}

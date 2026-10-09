import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import Orbi from '@/world/mascot/Orbi'
import PreviewCamera from './PreviewCamera'
import {
  DIALOGUE_MODEL_ROTATION,
  PREVIEW_AMBIENT_INTENSITY,
  PREVIEW_ENVIRONMENT_INTENSITY,
  PREVIEW_ENVIRONMENT_RESOLUTION,
  PREVIEW_FILL_INTENSITY,
  PREVIEW_FILL_POSITION,
  PREVIEW_KEY_INTENSITY,
  PREVIEW_KEY_POSITION,
  PREVIEW_MAIN_REFLECTION_INTENSITY,
  PREVIEW_MAIN_REFLECTION_POSITION,
  PREVIEW_MAIN_REFLECTION_SCALE,
  PREVIEW_MODEL_ROTATION,
  PREVIEW_PIXEL_RATIO,
  PREVIEW_REFLECTION_TARGET,
  PREVIEW_RIM_INTENSITY,
  PREVIEW_RIM_POSITION,
  PREVIEW_SHADOW_BLUR,
  PREVIEW_SHADOW_FAR,
  PREVIEW_SHADOW_OPACITY,
  PREVIEW_SHADOW_POSITION,
  PREVIEW_SHADOW_RESOLUTION,
  PREVIEW_SHADOW_SCALE,
  PREVIEW_SIDE_REFLECTION_INTENSITY,
  PREVIEW_SIDE_REFLECTION_POSITION,
  PREVIEW_SIDE_REFLECTION_SCALE,
  PREVIEW_STATIC_FRAMES,
  PREVIEW_TOP_REFLECTION_INTENSITY,
  PREVIEW_TOP_REFLECTION_POSITION,
  PREVIEW_TOP_REFLECTION_SCALE,
} from './constants'

export default function OrbiStage({ isInteractive }: { isInteractive: boolean }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={PREVIEW_PIXEL_RATIO}
      gl={{ antialias: true, alpha: true }}
      aria-label={
        isInteractive
          ? 'Interactive three-dimensional model of Orbi'
          : 'Orbi, a gold compass mascot wearing a red scarf'
      }
    >
      <ambientLight intensity={PREVIEW_AMBIENT_INTENSITY} />
      <directionalLight
        position={PREVIEW_KEY_POSITION}
        intensity={PREVIEW_KEY_INTENSITY}
        color="#fff0d7"
      />
      <directionalLight
        position={PREVIEW_FILL_POSITION}
        intensity={PREVIEW_FILL_INTENSITY}
        color="#dce7ff"
      />
      <directionalLight
        position={PREVIEW_RIM_POSITION}
        intensity={PREVIEW_RIM_INTENSITY}
        color="#ffd08e"
      />
      <Environment
        frames={PREVIEW_STATIC_FRAMES}
        resolution={PREVIEW_ENVIRONMENT_RESOLUTION}
        environmentIntensity={PREVIEW_ENVIRONMENT_INTENSITY}
      >
        <Lightformer
          position={PREVIEW_MAIN_REFLECTION_POSITION}
          scale={PREVIEW_MAIN_REFLECTION_SCALE}
          intensity={PREVIEW_MAIN_REFLECTION_INTENSITY}
          target={PREVIEW_REFLECTION_TARGET}
          color="#fff1df"
        />
        <Lightformer
          position={PREVIEW_SIDE_REFLECTION_POSITION}
          scale={PREVIEW_SIDE_REFLECTION_SCALE}
          intensity={PREVIEW_SIDE_REFLECTION_INTENSITY}
          target={PREVIEW_REFLECTION_TARGET}
          color="#dce7ff"
        />
        <Lightformer
          position={PREVIEW_TOP_REFLECTION_POSITION}
          scale={PREVIEW_TOP_REFLECTION_SCALE}
          intensity={PREVIEW_TOP_REFLECTION_INTENSITY}
          target={PREVIEW_REFLECTION_TARGET}
          color="#fff4dc"
        />
      </Environment>
      <Orbi rotation={isInteractive ? PREVIEW_MODEL_ROTATION : DIALOGUE_MODEL_ROTATION} />
      {isInteractive && (
        <ContactShadows
          position={PREVIEW_SHADOW_POSITION}
          scale={PREVIEW_SHADOW_SCALE}
          opacity={PREVIEW_SHADOW_OPACITY}
          blur={PREVIEW_SHADOW_BLUR}
          far={PREVIEW_SHADOW_FAR}
          resolution={PREVIEW_SHADOW_RESOLUTION}
          frames={PREVIEW_STATIC_FRAMES}
          color="#665241"
        />
      )}
      <PreviewCamera key={isInteractive ? 'model' : 'dialogue'} isInteractive={isInteractive} />
    </Canvas>
  )
}

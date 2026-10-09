import { useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { MathUtils } from 'three'
import {
  DIALOGUE_CAMERA_POSITION,
  PREVIEW_CAMERA_FAR,
  PREVIEW_CAMERA_FIELD_OF_VIEW,
  PREVIEW_CAMERA_NEAR,
  PREVIEW_CAMERA_POSITION,
  PREVIEW_CAMERA_TARGET,
  PREVIEW_MAX_DISTANCE,
  PREVIEW_MIN_ASPECT_RATIO,
  PREVIEW_MIN_DISTANCE,
  PREVIEW_ROTATE_SPEED,
  PREVIEW_ZOOM_SPEED,
} from './constants'

export default function PreviewCamera({ isInteractive }: { isInteractive: boolean }) {
  const size = useThree((state) => state.size)
  const widthCorrection = Math.max(1, PREVIEW_MIN_ASPECT_RATIO / (size.width / size.height))
  const halfFieldOfView = MathUtils.degToRad(PREVIEW_CAMERA_FIELD_OF_VIEW) / 2
  const fieldOfView = MathUtils.radToDeg(2 * Math.atan(Math.tan(halfFieldOfView) * widthCorrection))

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={isInteractive ? PREVIEW_CAMERA_POSITION : DIALOGUE_CAMERA_POSITION}
        fov={fieldOfView}
        near={PREVIEW_CAMERA_NEAR}
        far={PREVIEW_CAMERA_FAR}
      />
      <OrbitControls
        makeDefault
        enabled={isInteractive}
        target={PREVIEW_CAMERA_TARGET}
        enablePan={false}
        enableDamping={false}
        minDistance={PREVIEW_MIN_DISTANCE}
        maxDistance={PREVIEW_MAX_DISTANCE}
        rotateSpeed={PREVIEW_ROTATE_SPEED}
        zoomSpeed={PREVIEW_ZOOM_SPEED}
      />
    </>
  )
}

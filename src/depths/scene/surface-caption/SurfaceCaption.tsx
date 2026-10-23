import { createPortal } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type * as THREE from 'three'
import { DEPTHS_COPY } from '@/data/depthsCopy'
import { chooseRewind, useDepthsStore } from '@/store/depthsStore'
import { beginSurfacing, isDepthsInView, isDepthsScene, useViewStore } from '@/store/viewStore'
import { CAPTION_Z_INDEX_RANGE, CLOCK_CAPTION_SPOT } from './constants'
import './SurfaceCaption.scss'

interface SurfaceCaptionProps {
  clockRuin: THREE.Object3D
}

function rewindToSurface() {
  if (!isDepthsInView()) return
  chooseRewind()
  beginSurfacing()
}

export default function SurfaceCaption({ clockRuin }: SurfaceCaptionProps) {
  const isInDepths = useViewStore(isDepthsScene)
  const isShipLanded = useDepthsStore((state) => state.isShipLanded)
  const isShown = isInDepths && isShipLanded

  return createPortal(
    <Html position={CLOCK_CAPTION_SPOT} center zIndexRange={CAPTION_Z_INDEX_RANGE}>
      <div className={isShown ? 'surface-caption surface-caption--shown' : 'surface-caption'}>
        <button type="button" className="surface-caption__button" onClick={rewindToSurface}>
          <span className="surface-caption__arrow" />
          <span className="surface-caption__label">{DEPTHS_COPY.surface}</span>
        </button>
      </div>
    </Html>,
    clockRuin
  )
}

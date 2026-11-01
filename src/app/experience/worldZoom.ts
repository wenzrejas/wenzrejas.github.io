import { MathUtils } from 'three'
import { hasFinePointer } from '@/store/inputStore'
import { isSheetLayout } from '@/utils/layout'
import {
  CAMERA_HANDHELD_MAX_ZOOM,
  CAMERA_MIN_ZOOM_SHARE,
  CAMERA_ZOOM,
  CAMERA_ZOOM_REFERENCE_SIDE,
} from './constants'

const isHandheldView = () => !hasFinePointer() || isSheetLayout()

export function baseZoom(width: number, height: number) {
  const share = Math.min(width, height) / CAMERA_ZOOM_REFERENCE_SIDE
  const zoom = CAMERA_ZOOM * MathUtils.clamp(share, CAMERA_MIN_ZOOM_SHARE, 1)
  return isHandheldView() ? Math.min(zoom, CAMERA_HANDHELD_MAX_ZOOM) : zoom
}

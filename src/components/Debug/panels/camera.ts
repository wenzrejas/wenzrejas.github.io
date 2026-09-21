import { useControls } from 'leva'
import type { CameraControls } from '../types'

export function useCameraControls() {
  return useControls(
    'Camera',
    {
      orbitCamera: { value: false, label: 'orbit (free look)' },
      topView: { value: false, label: 'top view' },
    },
    { collapsed: true }
  ) as CameraControls
}

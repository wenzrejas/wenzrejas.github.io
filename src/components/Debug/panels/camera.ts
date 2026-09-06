import { useControls } from 'leva'
import type { CameraControls } from '../types'

export function useCameraControls() {
  return useControls(
    'Camera',
    {
      orbitCamera: { value: false, label: 'orbit (free look)' },
    },
    { collapsed: true }
  ) as CameraControls
}

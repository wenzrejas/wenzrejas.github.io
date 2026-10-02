import { useControls } from 'leva'
import { useDebugStore } from '@/store/debugStore'
import type { CameraControls } from '../types'

const DEFAULTS = useDebugStore.getInitialState().camera

export function useCameraControls() {
  return useControls(
    'Camera',
    {
      orbitCamera: { value: DEFAULTS.orbitCamera, label: 'orbit (free look)' },
      topView: { value: DEFAULTS.topView, label: 'top view' },
    },
    { collapsed: true }
  ) as CameraControls
}

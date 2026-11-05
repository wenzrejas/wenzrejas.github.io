import { useControls } from 'leva'
import { useDebugStore } from '@/store/debugStore'

const DEFAULTS = useDebugStore.getInitialState().camera

export function useCameraControls() {
  return useControls(
    'Camera',
    {
      orbitCamera: { value: DEFAULTS.orbitCamera, label: 'orbit (free look)' },
      topView: { value: DEFAULTS.topView, label: 'top view' },
    },
    { collapsed: true }
  )
}

import { useGLTF } from '@react-three/drei'
import { SCENERY_KIT_URL } from './scene/scenery-kit/constants'
import { SUNKEN_RUINS_URL } from './scene/sunken-ruins/constants'

type DepthsSceneModule = typeof import('./scene/DepthsScene')

let loading: Promise<DepthsSceneModule> | null = null

export function loadDepthsScene() {
  loading ??= import('./scene/DepthsScene').catch((error: unknown) => {
    loading = null
    throw error
  })
  return loading
}

export function prefetchDepths() {
  void loadDepthsScene().catch(() => undefined)
  useGLTF.preload(SUNKEN_RUINS_URL)
  useGLTF.preload(SCENERY_KIT_URL)
}

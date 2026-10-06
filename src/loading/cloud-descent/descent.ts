import * as THREE from 'three'
import { useLoadingStore } from '@/store/loadingStore'
import { ARRIVAL_ZOOM_FROM, CLOUD_LAYERS, CLOUD_ZOOM_LIMIT, DESCENT_SECONDS } from './constants'

function descentProgress() {
  const { descentStartedAt } = useLoadingStore.getState()
  if (descentStartedAt === null) return 0
  const seconds = (performance.now() - descentStartedAt) / 1000
  return THREE.MathUtils.smoothstep(seconds, 0, DESCENT_SECONDS)
}

export const arrivalZoom = () => ARRIVAL_ZOOM_FROM ** (1 - descentProgress())

export function updateCloudLayerZooms(zooms: number[]) {
  const cameraHeight = 1 / arrivalZoom()
  CLOUD_LAYERS.forEach(({ height }, layer) => {
    const startGap = 1 / ARRIVAL_ZOOM_FROM - height
    const gap = cameraHeight - height
    zooms[layer] = gap > startGap / CLOUD_ZOOM_LIMIT ? startGap / gap : CLOUD_ZOOM_LIMIT
  })
  return zooms
}

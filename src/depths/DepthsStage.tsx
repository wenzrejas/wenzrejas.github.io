import { Suspense, useEffect, useState, type ComponentType } from 'react'
import { failDepths } from '@/store/depthsStore'
import { isDepthsMounted, useViewStore } from '@/store/viewStore'
import DepthsErrorBoundary from './DepthsErrorBoundary'
import { loadDepthsScene } from './depthsSceneLoader'

export default function DepthsStage() {
  const isMounted = useViewStore(isDepthsMounted)
  const [DepthsScene, setDepthsScene] = useState<ComponentType | null>(null)

  useEffect(() => {
    if (!isMounted) return
    let isCurrent = true
    loadDepthsScene().then(
      (module) => {
        if (isCurrent) setDepthsScene(() => module.default)
      },
      (error: unknown) => {
        console.error(error)
        if (isCurrent) failDepths()
      }
    )
    return () => {
      isCurrent = false
    }
  }, [isMounted])

  if (!isMounted || !DepthsScene) return null

  return (
    <DepthsErrorBoundary onError={failDepths}>
      <Suspense fallback={null}>
        <DepthsScene />
      </Suspense>
    </DepthsErrorBoundary>
  )
}

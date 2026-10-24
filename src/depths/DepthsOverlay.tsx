import DepthGauge from '@/hud/depth-gauge/DepthGauge'
import { useDepthsStore } from '@/store/depthsStore'
import { isTravelHeld, useGuideStore } from '@/store/guideStore'
import { useHudStore } from '@/store/hudStore'
import { isDepthsScene, useViewStore } from '@/store/viewStore'

export default function DepthsOverlay() {
  const isInDepths = useViewStore(isDepthsScene)
  const isRevealed = useDepthsStore((state) => state.isRevealed)
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isGuideHolding = useGuideStore(isTravelHeld)

  if (!isInDepths || !isRevealed) return null

  return <DepthGauge isTapeShown={isHudVisible} isLocked={isGuideHolding} />
}

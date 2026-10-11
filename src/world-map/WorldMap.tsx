import { useEffect, useRef, useState, type AnimationEvent } from 'react'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import MapPaper from '@/loading/map-paper/MapPaper'
import { useLoadingStore } from '@/store/loadingStore'
import {
  closeWorldMap,
  finishMapFold,
  finishMapUnfold,
  isMapUnfolded,
  useViewStore,
} from '@/store/viewStore'
import type { IslandKey } from '@/world/islands/shared/constants'
import { FOLD_ANIMATION, UNFOLD_ANIMATION } from './constants'
import { sailTo } from './fastTravel'
import IslandsPanel from './islands-panel/IslandsPanel'
import MapArt from './map-art/MapArt'
import { preloadWorldMap } from './worldMapPreload'
import './WorldMap.scss'

export default function WorldMap() {
  const hasMapOpened = useViewStore((state) => state.hasMapOpened)
  const isClosed = useViewStore((state) => state.mapPhase === 'closed')
  const isUnfolded = useViewStore(isMapUnfolded)
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const paperRef = useRef<HTMLCanvasElement>(null)
  const [selectedIsland, setSelectedIsland] = useState<IslandKey | null>(null)

  useEffect(() => {
    if (isLoaderGone) preloadWorldMap()
  }, [isLoaderGone])

  if (!hasMapOpened) return null

  const motion = isClosed ? null : isUnfolded ? 'unfold' : 'fold'

  const finishMotion = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return
    if (event.animationName === UNFOLD_ANIMATION) finishMapUnfold()
    if (event.animationName !== FOLD_ANIMATION) return
    setSelectedIsland(null)
    finishMapFold()
  }

  const setSail = () => {
    if (selectedIsland) sailTo(selectedIsland)
  }

  return (
    <section
      className={motion ? `world-map world-map--${motion}` : 'world-map world-map--closed'}
      aria-label={WORLD_MAP_COPY.title}
      onAnimationEnd={finishMotion}
    >
      <MapPaper ref={paperRef} />
      <div className="world-map__creases" />
      <div className="world-map__chart">
        <MapArt selectedIsland={selectedIsland} motion={motion} />
      </div>
      <IslandsPanel
        selectedIsland={selectedIsland}
        motion={motion}
        onSelect={setSelectedIsland}
        onSetSail={setSail}
        onClose={closeWorldMap}
      />
    </section>
  )
}

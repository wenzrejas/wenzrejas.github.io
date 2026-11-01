import { useCallback, useEffect, useRef, useState, type AnimationEvent } from 'react'
import { audio } from '@/audio/audioManager'
import { WORLD_MAP_COPY } from '@/data/worldMapCopy'
import MapPaper from '@/loading/map-paper/MapPaper'
import { isModalDialogue, useGuideStore } from '@/store/guideStore'
import { useLoadingStore } from '@/store/loadingStore'
import {
  closeWorldMap,
  finishMapFold,
  finishMapUnfold,
  isMapUnfolded,
  useViewStore,
} from '@/store/viewStore'
import { useSheetPortrait } from '@/utils/layout'
import type { IslandKey } from '@/world/islands/shared/constants'
import { FOLD_ANIMATION, UNFOLD_ANIMATION } from './constants'
import { sailTo } from './fastTravel'
import IslandsPanel from './islands-panel/IslandsPanel'
import IslandsSheet from './islands-sheet/IslandsSheet'
import MapArt from './map-art/MapArt'
import { preloadWorldMap } from './worldMapPreload'
import './WorldMap.scss'

export default function WorldMap() {
  const hasMapOpened = useViewStore((state) => state.hasMapOpened)
  const isClosed = useViewStore((state) => state.mapPhase === 'closed')
  const isUnfolded = useViewStore(isMapUnfolded)
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const isGuideSpeaking = useGuideStore(isModalDialogue)
  const isSheetPortrait = useSheetPortrait()
  const paperRef = useRef<HTMLCanvasElement>(null)
  const [selectedIsland, setSelectedIsland] = useState<IslandKey | null>(null)
  const [isListOpen, setListOpen] = useState(false)

  const selectIsland = useCallback((island: IslandKey) => {
    setSelectedIsland(island)
    setListOpen(false)
  }, [])

  useEffect(() => {
    if (isLoaderGone) preloadWorldMap()
  }, [isLoaderGone])

  useEffect(
    () =>
      useViewStore.subscribe(({ mapPhase }, previous) => {
        const isTurning = mapPhase === 'unfolding' || mapPhase === 'folding'
        if (isTurning && mapPhase !== previous.mapPhase) audio.play('paperPanel')
      }),
    []
  )

  if (!hasMapOpened) return null

  const motion = isClosed ? null : isUnfolded ? 'unfold' : 'fold'

  const finishMotion = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return
    if (event.animationName === UNFOLD_ANIMATION) finishMapUnfold()
    if (event.animationName !== FOLD_ANIMATION) return
    setSelectedIsland(null)
    setListOpen(false)
    finishMapFold()
  }

  const setSail = () => {
    if (selectedIsland) sailTo(selectedIsland)
  }

  return (
    <section
      className={motion ? `world-map world-map--${motion}` : 'world-map world-map--closed'}
      aria-label={WORLD_MAP_COPY.title}
      inert={isGuideSpeaking}
      onAnimationEnd={finishMotion}
    >
      <MapPaper ref={paperRef} />
      <div className="world-map__creases" />
      <div className="world-map__chart">
        <MapArt
          selectedIsland={selectedIsland}
          motion={motion}
          onSetSail={isSheetPortrait ? undefined : setSail}
          onSelectIsland={selectIsland}
        />
      </div>
      {isSheetPortrait ? (
        <IslandsSheet
          selectedIsland={selectedIsland}
          isListOpen={isListOpen}
          motion={motion}
          onSelect={selectIsland}
          onToggleList={() => setListOpen((isOpen) => !isOpen)}
          onSetSail={setSail}
          onClose={closeWorldMap}
        />
      ) : (
        <IslandsPanel
          selectedIsland={selectedIsland}
          motion={motion}
          onSelect={selectIsland}
          onClose={closeWorldMap}
        />
      )}
    </section>
  )
}

import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { LOADING_COPY } from '@/data/loadingCopy'
import Cartouche from '@/panels/shared/cartouche/Cartouche'
import { setSail, useLoadingStore } from '@/store/loadingStore'
import { useCloudDescent } from './cloud-descent/useCloudDescent'
import { HANDWRITING_FONT, SHIP_IMAGE_URL } from './constants'
import CourseBar from './course-bar/CourseBar'
import HandwrittenMessage from './handwritten-message/HandwrittenMessage'
import { ARRIVED_MESSAGE } from './loadingMessages'
import { loadedShare } from './loadingProgress'
import MapImagery from './map-imagery/MapImagery'
import MapPaper from './map-paper/MapPaper'
import { prepareMistDissolve } from './mist-dissolve/mistDissolveModel'
import { startPreloads } from './preloadTasks'
import SoundToggle from './sound-toggle/SoundToggle'
import { useFontLoaded } from './useFontLoaded'
import { useLoadingPace } from './useLoadingPace'
import './LoadingScreen.scss'

export default function LoadingScreen() {
  const screenRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLCanvasElement>(null)
  const shipRef = useRef<HTMLImageElement>(null)
  const downloadPercent = useProgress((state) => state.progress)
  const pendingTasks = useLoadingStore((state) => state.pendingTasks)
  const hasSetSail = useLoadingStore((state) => state.hasSetSail)
  const isLoaderGone = useLoadingStore((state) => state.isLoaderGone)
  const isFontLoaded = useFontLoaded(HANDWRITING_FONT)
  const messages = useLoadingPace(
    loadedShare(downloadPercent, pendingTasks),
    isFontLoaded,
    screenRef
  )
  const hasArrived = messages.shown === ARRIVED_MESSAGE
  const canSetSail = hasArrived && messages.isSettled

  useCloudDescent(hasSetSail)

  useEffect(() => startPreloads(), [])

  useEffect(() => {
    if (canSetSail && paperRef.current) prepareMistDissolve(paperRef.current, shipRef.current)
  }, [canSetSail])

  const sail = () => {
    if (paperRef.current) prepareMistDissolve(paperRef.current, shipRef.current)
    setSail()
  }

  if (isLoaderGone) return null

  return (
    <div
      ref={screenRef}
      className={hasSetSail ? 'loading-screen loading-screen--dissolving' : 'loading-screen'}
    >
      <div className="loading-screen__map">
        <MapPaper ref={paperRef} />
        <MapImagery isCharted={hasArrived} />
        <img
          ref={shipRef}
          className="loading-screen__ship"
          src={SHIP_IMAGE_URL}
          alt=""
          draggable={false}
        />
      </div>
      <div className="loading-screen__sound">
        <SoundToggle />
      </div>
      <div className="loading-screen__caption">
        {isFontLoaded && (
          <HandwrittenMessage message={messages.shown} fadingMessage={messages.fading} />
        )}
      </div>
      <div className="loading-screen__course">
        <CourseBar isHidden={hasArrived} />
        {canSetSail && (
          <button
            type="button"
            className="loading-screen__set-sail"
            onClick={sail}
            disabled={hasSetSail}
          >
            <Cartouche />
            <span className="loading-screen__set-sail-label">{LOADING_COPY.setSail}</span>
          </button>
        )}
      </div>
    </div>
  )
}

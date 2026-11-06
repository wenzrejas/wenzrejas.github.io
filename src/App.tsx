import { lazy, Suspense } from 'react'
import Achievements from './achievements/Achievements'
import Experience from './app/experience/Experience'
import FailureBoundary from './app/FailureBoundary'
import { RELOADABLE_ERROR } from './app/webgl-failure/constants'
import WebglFailureScreen from './app/webgl-failure/WebglFailureScreen'
import IslandTitle from './world/islands/shared/IslandTitle'
import { IS_DEBUG } from './app/experience/constants'
import Soundscape from './audio/Soundscape'
import Joystick from './controls/joystick/Joystick'
import DepthsOverlay from './depths/DepthsOverlay'
import Guide from './guide/Guide'
import Hud from './hud/Hud'
import HudMenu from './hud/menu/HudMenu'
import LoadingScreen from './loading/LoadingScreen'
import RaceCountdown from './minigames/checkpoint-run/countdown/RaceCountdown'
import RunResults from './minigames/checkpoint-run/results/RunResults'
import StartPrompt from './minigames/checkpoint-run/start-prompt/StartPrompt'
import Panels from './panels/Panels'
import { reportWebglFailure, useWebglStore } from './store/webglStore'
import WorldMap from './world-map/WorldMap'

const DebugTools =
  import.meta.env.DEV && IS_DEBUG ? lazy(() => import('./app/debug/DebugTools')) : null

const reportAppFailure = (error: unknown) =>
  reportWebglFailure(
    error instanceof Error && RELOADABLE_ERROR.test(error.message) ? 'graphics' : 'crash'
  )

export default function App() {
  const hasWebglFailed = useWebglStore((state) => state.hasFailed)

  if (hasWebglFailed) return <WebglFailureScreen />

  return (
    <FailureBoundary onError={reportAppFailure}>
      {DebugTools && (
        <Suspense fallback={null}>
          <DebugTools />
        </Suspense>
      )}
      <Soundscape />
      <Experience />
      <DepthsOverlay />
      <IslandTitle />
      <Hud />
      <Joystick />
      <HudMenu />
      <Guide />
      <Achievements />
      <StartPrompt />
      <RaceCountdown />
      <RunResults />
      <Panels />
      <WorldMap />
      <LoadingScreen />
    </FailureBoundary>
  )
}

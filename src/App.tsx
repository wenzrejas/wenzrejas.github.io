import { lazy, Suspense } from 'react'
import Achievements from './achievements/Achievements'
import Experience from './app/experience/Experience'
import IslandTitle from './world/islands/shared/IslandTitle'
import { IS_DEBUG } from './app/experience/constants'
import Soundscape from './audio/Soundscape'
import Joystick from './controls/joystick/Joystick'
import DepthsOverlay from './depths/DepthsOverlay'
import Guide from './guide/Guide'
import Hud from './hud/Hud'
import HudMenu from './hud/menu/HudMenu'
import LoadingScreen from './loading/LoadingScreen'
import Panels from './panels/Panels'
import WorldMap from './world-map/WorldMap'

const DebugTools =
  import.meta.env.DEV && IS_DEBUG ? lazy(() => import('./app/debug/DebugTools')) : null

export default function App() {
  return (
    <>
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
      <Panels />
      <WorldMap />
      <LoadingScreen />
    </>
  )
}

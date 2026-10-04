import { lazy, Suspense } from 'react'
import Experience from './app/experience/Experience'
import IslandTitle from './world/islands/shared/IslandTitle'
import { IS_DEBUG } from './app/experience/constants'
import Soundscape from './audio/Soundscape'
import Hud from './hud/Hud'
import HudMenu from './hud/menu/HudMenu'
import LoadingScreen from './loading/LoadingScreen'
import Panels from './panels/Panels'

const DebugTools = lazy(() => import('./app/debug/DebugTools'))

export default function App() {
  return (
    <>
      {IS_DEBUG && (
        <Suspense fallback={null}>
          <DebugTools />
        </Suspense>
      )}
      <Soundscape />
      <Experience />
      <IslandTitle />
      <Hud />
      <HudMenu />
      <Panels />
      <LoadingScreen />
    </>
  )
}

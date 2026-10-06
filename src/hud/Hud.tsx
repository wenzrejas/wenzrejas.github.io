import { useHudStore } from '../store/hudStore'
import { useLoadingStore } from '../store/loadingStore'
import { isDepthsScene, useViewStore } from '../store/viewStore'
import Compass from './compass/Compass'
import Minimap from './minimap/Minimap'
import WeatherPanel from './weather/WeatherPanel'
import './Hud.scss'

export default function Hud() {
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isInDepths = useViewStore(isDepthsScene)
  const isWorldRevealed = useLoadingStore((state) => state.isLoaderGone)

  return (
    <div className={isHudVisible && isWorldRevealed && !isInDepths ? 'hud' : 'hud hud--hidden'}>
      <Compass />
      <Minimap />
      <WeatherPanel />
    </div>
  )
}

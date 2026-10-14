import { useIsIntroductionOver } from '../store/guideStore'
import { useHudStore } from '../store/hudStore'
import { isDepthsScene, useViewStore } from '../store/viewStore'
import Compass from './compass/Compass'
import Minimap from './minimap/Minimap'
import WeatherPanel from './weather/WeatherPanel'
import './Hud.scss'

export default function Hud() {
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isInDepths = useViewStore(isDepthsScene)
  const isIntroductionOver = useIsIntroductionOver()

  return (
    <div className={isHudVisible && isIntroductionOver && !isInDepths ? 'hud' : 'hud hud--hidden'}>
      <Compass />
      <Minimap />
      <WeatherPanel />
    </div>
  )
}

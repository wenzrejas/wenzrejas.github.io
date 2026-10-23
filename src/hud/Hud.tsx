import { useIsIntroductionOver } from '../store/guideStore'
import { useHudStore } from '../store/hudStore'
import { isWorldScene, useViewStore } from '../store/viewStore'
import Compass from './compass/Compass'
import Minimap from './minimap/Minimap'
import WeatherPanel from './weather/WeatherPanel'
import './Hud.scss'

export default function Hud() {
  const isHudVisible = useHudStore((state) => state.isHudVisible)
  const isInWorld = useViewStore(isWorldScene)
  const isIntroductionOver = useIsIntroductionOver()

  return (
    <div className={isHudVisible && isIntroductionOver && isInWorld ? 'hud' : 'hud hud--hidden'}>
      <Compass />
      <Minimap />
      <WeatherPanel />
    </div>
  )
}

import { useHudStore } from '../store/hudStore'
import Compass from './compass/Compass'
import Minimap from './minimap/Minimap'
import WeatherPanel from './weather/WeatherPanel'
import './Hud.scss'

export default function Hud() {
  const isHudVisible = useHudStore((state) => state.isHudVisible)

  return (
    <div className={isHudVisible ? 'hud' : 'hud hud--hidden'}>
      <Compass />
      <Minimap />
      <WeatherPanel />
    </div>
  )
}

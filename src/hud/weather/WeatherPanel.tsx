import { useEffect, useRef, useState } from 'react'
import { useCycleStore } from '@/store/cycleStore'
import { WEATHER_LABELS, readWeather, readWindPoint } from './conditions'
import {
  DIAL_SKY_GRADIENT,
  MOON_POSITION,
  STAR_POSITIONS,
  SUN_POSITION,
  wheelTurnDegrees,
} from './dial'
import WeatherIcon from './WeatherIcon'
import WindCurvesIcon from './WindCurvesIcon'
import './WeatherPanel.scss'

export default function WeatherPanel() {
  const [weather, setWeather] = useState(readWeather)
  const [windPoint, setWindPoint] = useState(readWindPoint)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return

    let frame = 0
    const tick = () => {
      setWeather(readWeather())
      setWindPoint(readWindPoint())
      const turn = wheelTurnDegrees(useCycleStore.getState().timeOfDay)
      wheel.style.setProperty('--wheel-turn', `${turn}deg`)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="weather-panel">
      <span className="weather-panel__icon">
        <WeatherIcon weather={weather} />
      </span>
      <div className="weather-panel__readout">
        <span className="weather-panel__name">{WEATHER_LABELS[weather]}</span>
        <span className="weather-panel__wind">
          <span className="weather-panel__wind-icon">
            <WindCurvesIcon />
          </span>
          WIND: {windPoint}
        </span>
      </div>
      <div className="weather-panel__dial">
        <div className="weather-panel__sky">
          <div
            className="weather-panel__wheel"
            ref={wheelRef}
            style={{ backgroundImage: DIAL_SKY_GRADIENT }}
          >
            {STAR_POSITIONS.map((position, index) => (
              <span key={index} className="weather-panel__star" style={position} />
            ))}
            <span className="weather-panel__sun" style={SUN_POSITION} />
            <span className="weather-panel__moon" style={MOON_POSITION} />
          </div>
        </div>
        <span className="weather-panel__pointer" />
      </div>
    </div>
  )
}

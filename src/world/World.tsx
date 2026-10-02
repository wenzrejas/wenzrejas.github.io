import { useRef, forwardRef } from 'react'
import * as THREE from 'three'
import Boundary from './environment/boundary/Boundary'
import Islands from './islands/Islands'
import IslandReveal from './islands/shared/IslandReveal'
import Ocean from './environment/ocean/Ocean'
import ShoreRipples from './shore/ShoreRipples'
import Ship from './ship/Ship'
import HullRipples from './ship/HullRipples'
import WakeTrail from './ship/WakeTrail'
import WakeRipples from './ship/WakeRipples'
import WindLines from './environment/wind-lines/WindLines'
import WeatherSystem from './environment/weather/WeatherSystem'
import CloudShadows from './environment/weather/CloudShadows'
import Birds from './wildlife/birds/Birds'
import Fish from './wildlife/fish/Fish'
import Dolphins from './wildlife/dolphins/Dolphins'
import Algae from './wildlife/algae/Algae'
import Turtles from './wildlife/turtles/Turtles'
import Whale from './wildlife/whale/Whale'

const World = forwardRef<THREE.Group>((_props, forwardedRef) => {
  const shipRef = useRef<THREE.Group>(null)

  return (
    <>
      <Boundary />
      <Islands />
      <Ocean />
      <ShoreRipples />
      <Ship
        ref={(el) => {
          ;(shipRef as React.MutableRefObject<THREE.Group | null>).current = el
          if (typeof forwardedRef === 'function') forwardedRef(el)
          else if (forwardedRef) forwardedRef.current = el
        }}
      />
      <IslandReveal shipRef={shipRef} />
      <HullRipples shipRef={shipRef} />
      <WakeTrail shipRef={shipRef} />
      <WakeRipples shipRef={shipRef} />
      <WindLines shipRef={shipRef} />
      <WeatherSystem shipRef={shipRef} />
      <CloudShadows />
      <Birds />
      <Fish />
      <Dolphins />
      <Algae />
      <Turtles />
      <Whale />
    </>
  )
})

World.displayName = 'World'
export default World

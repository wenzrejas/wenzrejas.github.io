import { useRef, forwardRef } from 'react'
import * as THREE from 'three'
import type { IslandKey } from './Islands/constants'
import Boundary from './Boundary/Boundary'
import Islands from './Islands/Islands'
import IslandReveal from './Islands/IslandReveal'
import Ocean from './Ocean/Ocean'
import ShoreRipples from './Shore/ShoreRipples'
import Ship from './Ship/Ship'
import HullRipples from './Ship/HullRipples'
import WakeTrail from './Ship/WakeTrail'
import WakeRipples from './Ship/WakeRipples'
import WindLines from './WindLines/WindLines'
import WeatherSystem from './Weather/WeatherSystem'
import CloudShadows from './Weather/CloudShadows'
import Birds from './Birds/Birds'
import Fish from './Fish/Fish'
import Dolphins from './Dolphins/Dolphins'
import Algae from './Algae/Algae'
import Turtles from './Turtles/Turtles'
import Whale from './Whale/Whale'

interface WorldProps {
  onIslandSelect: (key: IslandKey) => void
}

const World = forwardRef<THREE.Group, WorldProps>(({ onIslandSelect }, forwardedRef) => {
  const shipRef = useRef<THREE.Group>(null)

  return (
    <>
      <Boundary />
      <Islands onSelect={onIslandSelect} />
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

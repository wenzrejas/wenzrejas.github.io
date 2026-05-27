import { useRef, forwardRef } from 'react'
import * as THREE from 'three'
import type { IslandKey } from './Islands/constants'
import Boundary from './Boundary/Boundary'
import Islands from './Islands/Islands'
import Ocean from './Ocean/Ocean'
import Ship from './Ship/Ship'
import WakeTrail from './Ship/WakeTrail'
import WakeRipples from './Ship/WakeRipples'
import WindLines from './WindLines/WindLines'
import WeatherSystem from './Weather/WeatherSystem'

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
      <Ship
        ref={(el) => {
          ;(shipRef as React.MutableRefObject<THREE.Group | null>).current = el
          if (typeof forwardedRef === 'function') forwardedRef(el)
          else if (forwardedRef) forwardedRef.current = el
        }}
      />
      <WakeTrail shipRef={shipRef} />
      <WakeRipples shipRef={shipRef} />
      <WindLines shipRef={shipRef} />
      <WeatherSystem shipRef={shipRef} />
    </>
  )
})

World.displayName = 'World'
export default World

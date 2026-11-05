import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import CheckpointRuns from '@/minigames/checkpoint-run/CheckpointRuns'
import BottleField from '@/minigames/message-in-a-bottle/BottleField'
import NightEvents from '@/minigames/night-events/NightEvents'
import Boundary from './environment/boundary/Boundary'
import Islands from './islands/Islands'
import IslandReveal from './islands/shared/IslandReveal'
import Ocean from './environment/ocean/Ocean'
import ShoreRipples from './shore/ShoreRipples'
import Ship from './ship/Ship'
import HullRipples from './ship/HullRipples'
import type { HullOutline } from './ship/hullOutline'
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

interface WorldProps {
  shipRef: RefObject<THREE.Group | null>
}

export default function World({ shipRef }: WorldProps) {
  const hullOutlineRef = useRef<HullOutline | null>(null)

  return (
    <>
      <Boundary />
      <Islands />
      <Ocean />
      <ShoreRipples />
      <Ship shipRef={shipRef} hullOutlineRef={hullOutlineRef} />
      <IslandReveal shipRef={shipRef} />
      <HullRipples shipRef={shipRef} hullOutlineRef={hullOutlineRef} />
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
      <BottleField />
      <NightEvents />
      <CheckpointRuns />
    </>
  )
}

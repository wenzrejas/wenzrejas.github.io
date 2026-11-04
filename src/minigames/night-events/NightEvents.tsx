import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCycleStore } from '@/store/cycleStore'
import {
  beginNightEvent,
  endNightEvent,
  isNightEventOn,
  useNightEventStore,
} from '@/store/nightEventStore'
import { useWeatherStore } from '@/store/weatherStore'
import { orderPatch } from '@/world/wildlife/algae/algaeField'
import { isNightWindow } from '@/world/wildlife/algae/patches'
import JellyfishBloom from '../jellyfish-bloom/JellyfishBloom'
import LanternField from '../lantern-night/LanternField'
import { canHoldNightEvent, chooseNightEvent } from './nightRoll'

export default function NightEvents() {
  const wasNight = useRef(false)
  const wasOn = useRef(false)

  useFrame(() => {
    const isNight = isNightWindow(useCycleStore.getState().timeOfDay)
    const { isForced } = useNightEventStore.getState()
    if (isNight !== wasNight.current && !isForced) {
      if (!isNight) endNightEvent()
      else if (canHoldNightEvent(useWeatherStore.getState())) {
        beginNightEvent(chooseNightEvent(Math.random))
      }
    }
    wasNight.current = isNight

    const isOn = isNightEventOn()
    if (isOn && !wasOn.current) orderPatch('clear')
    wasOn.current = isOn
  })

  return (
    <>
      <LanternField />
      <JellyfishBloom />
    </>
  )
}

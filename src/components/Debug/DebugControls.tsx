import { useDebugStore } from '../../store/debugStore'
import { useOceanControls } from './panels/ocean'
import { useShipControls } from './panels/ship'
import { useIslandControls } from './panels/island'
import { useWakeControls } from './panels/wake'
import { useBoundaryControls } from './panels/boundary'
import { useWindLinesControls } from './panels/windLines'
import { useWeatherControls } from './panels/weather'
import { useDayCycleControls } from './panels/dayCycle'
import { useCameraControls } from './panels/camera'
import { useRevealControls } from './panels/reveal'

export function DebugSync() {
  const ocean = useOceanControls()
  const ship = useShipControls()
  const islands = useIslandControls()
  const wake = useWakeControls()
  const boundary = useBoundaryControls()
  const windLines = useWindLinesControls()
  const weather = useWeatherControls()
  const dayCycle = useDayCycleControls()
  const camera = useCameraControls()
  const reveal = useRevealControls()

  useDebugStore.setState({
    ocean,
    ship,
    islands,
    wake,
    boundary,
    windLines,
    weather,
    dayCycle,
    camera,
    reveal,
  })

  return null
}

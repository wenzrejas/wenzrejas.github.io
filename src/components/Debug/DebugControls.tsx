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

export function DebugSync() {
  const ocean = useOceanControls()
  const ship = useShipControls()
  const island = useIslandControls()
  const wake = useWakeControls()
  const boundary = useBoundaryControls()
  const windLines = useWindLinesControls()
  const weather = useWeatherControls()
  const dayCycle = useDayCycleControls()
  const camera = useCameraControls()

  useDebugStore.setState({
    ocean,
    ship,
    island,
    wake,
    boundary,
    windLines,
    weather,
    dayCycle,
    camera,
  })

  return null
}

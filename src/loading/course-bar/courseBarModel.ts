import { HEAD_REACH, TRACK_START, WHEEL_HUB, WHEEL_SPOKE_REACH, WHEEL_SPOKES } from './constants'

function spokes() {
  return Array.from({ length: WHEEL_SPOKES }, (_, i) => {
    const angle = (i / WHEEL_SPOKES) * Math.PI * 2
    const across = Math.cos(angle)
    const down = Math.sin(angle)
    return `M${across * WHEEL_HUB} ${down * WHEEL_HUB}L${across * WHEEL_SPOKE_REACH} ${down * WHEEL_SPOKE_REACH}`
  }).join('')
}

export const WHEEL_SPOKES_PATH = spokes()

export const headPath = (middle: number) =>
  `M${TRACK_START} ${middle - HEAD_REACH}V${middle + HEAD_REACH}` +
  `M${TRACK_START - HEAD_REACH} ${middle}H${TRACK_START + HEAD_REACH}`

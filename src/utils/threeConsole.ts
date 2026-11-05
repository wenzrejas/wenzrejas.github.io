import { setConsoleFunction } from 'three'

const FIBER_CLOCK_DEPRECATION = 'THREE.Clock: This module has been deprecated'

export function muteFiberClockDeprecation() {
  setConsoleFunction((type, message, ...details) => {
    if (message.startsWith(FIBER_CLOCK_DEPRECATION)) return
    console[type](message, ...details)
  })
}

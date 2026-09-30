import { useFrame } from '@react-three/fiber'
import { LOGO_BOB_HEIGHT, LOGO_SWAY, LOGO_SWAY_RATE } from './constants'
import type { FloatingLogo } from './monoliths'

function floatLogos(logos: FloatingLogo[], time: number) {
  for (const { node, restY, startYaw, spinRate, bobRate, phase } of logos) {
    node.rotation.y =
      startYaw + time * spinRate + Math.sin(time * LOGO_SWAY_RATE + phase) * LOGO_SWAY
    node.position.y = restY + Math.sin(time * bobRate + phase) * LOGO_BOB_HEIGHT
  }
}

export function useLogoFloat(logos: FloatingLogo[]) {
  useFrame(({ clock }) => floatLogos(logos, clock.getElapsedTime()))
}

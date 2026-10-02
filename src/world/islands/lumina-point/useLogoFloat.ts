import { useFrame } from '@react-three/fiber'
import { LOGO_BOB_HEIGHT, LOGO_HOVER_RISE, LOGO_SWAY, LOGO_SWAY_RATE } from './constants'
import type { Monolith } from './monoliths'

function floatLogos(monoliths: Monolith[], time: number) {
  for (const { logo, hoverBlend } of monoliths) {
    const { node, restY, startYaw, spinRate, bobRate, phase } = logo
    node.rotation.y =
      startYaw + time * spinRate + Math.sin(time * LOGO_SWAY_RATE + phase) * LOGO_SWAY
    node.position.y =
      restY + Math.sin(time * bobRate + phase) * LOGO_BOB_HEIGHT + hoverBlend * LOGO_HOVER_RISE
  }
}

export function useLogoFloat(monoliths: Monolith[]) {
  useFrame(({ clock }) => floatLogos(monoliths, clock.getElapsedTime()))
}

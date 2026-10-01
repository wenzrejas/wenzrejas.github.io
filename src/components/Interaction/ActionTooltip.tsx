import type { ReactNode } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { Html } from '@react-three/drei'
import type { Vector3 } from '@react-three/fiber'
import { TOOLTIP_FADE_SPRING, TOOLTIP_HIDDEN_SCALE, TOOLTIP_POP_SPRING } from './constants'
import './ActionTooltip.scss'

interface ActionTooltipProps {
  position: Vector3
  icon: ReactNode
  label: string
  isShown: boolean
  onHover: (isHovered: boolean) => void
  onActivate: () => void
}

export default function ActionTooltip({
  position,
  icon,
  label,
  isShown,
  onHover,
  onActivate,
}: ActionTooltipProps) {
  const { scale, opacity } = useSpring({
    scale: isShown ? 1 : TOOLTIP_HIDDEN_SCALE,
    opacity: isShown ? 1 : 0,
    config: (key) => (isShown && key === 'scale' ? TOOLTIP_POP_SPRING : TOOLTIP_FADE_SPRING),
  })

  return (
    <Html position={position}>
      <animated.button
        type="button"
        className="action-tooltip"
        style={{
          scale,
          opacity,
          visibility: opacity.to((value) => (value > 0 ? 'visible' : 'hidden')),
        }}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onClick={onActivate}
      >
        {icon}
        {label}
      </animated.button>
    </Html>
  )
}

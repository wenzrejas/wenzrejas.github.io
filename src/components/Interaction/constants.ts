import type { SpringConfig } from '@react-spring/web'

export const INTERACTION_LAYER = 1
export const HIT_AREAS_VISIBLE = false
export const HIT_AREA_COLOR = '#6ff7ff'

export const TOOLTIP_HIDDEN_SCALE = 0.5
export const TOOLTIP_POP_SPRING: SpringConfig = { tension: 400, friction: 18, clamp: false }
export const TOOLTIP_FADE_SPRING: SpringConfig = { tension: 500, friction: 45, clamp: true }

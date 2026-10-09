import type { SpringConfig } from '@react-spring/web'

export const INTERACTION_LAYER = 1
export const SHIP_HOVER_REACH = 85
export const BASE_TOUCH_REACH = 8
export const BASE_FOOTPRINT_SECTORS = 72
export const KEYBOARD_TARGETS = 'a, button, input, select, textarea, [contenteditable]'

export const HOVER_EASE_RATE = 6
export const HOVER_SNAP_GAP = 0.001

// ── Marker ────────────────────────────────────────────────────────────────────
export const MARKER_PIXELS = 34
export const MARKER_EXTENT = 1.12
export const MARKER_IDLE_CORE = 0.4
export const MARKER_HOVER_CORE = 0.46
export const MARKER_RING_OUTER = 0.86
export const MARKER_RING_WIDTH = 0.16
export const MARKER_RING_START = 0.7
export const MARKER_GAP = 0.1
export const MARKER_OUTLINE = 0.1
export const MARKER_OUTLINE_OPACITY = 0.8
export const MARKER_CENTER_SHARE = 0.4
export const MARKER_GLOW_REACH = 0.4
export const MARKER_GLOW_OPACITY = 0.55
export const MARKER_COLOR = '#33e6cc'
export const MARKER_CENTER_COLOR = '#ffffff'
export const MARKER_OUTLINE_COLOR = '#14182a'

export const MARKER_SPRING_STIFFNESS = 420
export const MARKER_SPRING_DAMPING = 26

export const MARKER_PULSE_SECONDS = 1.8
export const MARKER_PULSE_REACH = 0.86
export const MARKER_PULSE_WIDTH = 0.08
export const MARKER_PULSE_OPACITY = 0.9
export const MARKER_PULSE_SWELL = 0.1

export const MARKER_FADE_RATE = 12

export const MARKER_LABEL_SLIDE = 10
export const MARKER_LABEL_SPRING: SpringConfig = { tension: 700, friction: 30, clamp: false }

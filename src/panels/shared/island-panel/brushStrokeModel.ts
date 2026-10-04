import * as THREE from 'three'
import { seededRandom, type Random } from '../procedural/valueNoise'
import {
  BRUSH_BASELINE,
  BRUSH_BODY_THINNING,
  BRUSH_CORE_END_MIN,
  BRUSH_CORE_SHARE,
  BRUSH_EDGE_END_MIN,
  BRUSH_EDGE_END_SPREAD,
  BRUSH_EDGE_START_DELAY,
  BRUSH_HEIGHT,
  BRUSH_LENGTH,
  BRUSH_PRESS_SHARE,
  BRUSH_PULSE_CORE_SHARE,
  BRUSH_PULSE_DEPTH,
  BRUSH_PULSE_RATE_MIN,
  BRUSH_PULSE_RATE_SPREAD,
  BRUSH_RISE,
  BRUSH_SAMPLES,
  BRUSH_SEED,
  BRUSH_START,
  BRUSH_STRAND_DRIFT,
  BRUSH_STRAND_OVERLAP,
  BRUSH_STRAND_START_SPREAD,
  BRUSH_STRAND_TAPER_SHARE,
  BRUSH_STRAND_WEIGHT_MIN,
  BRUSH_STRAND_WEIGHT_SPREAD,
  BRUSH_STRAND_WOBBLE,
  BRUSH_STRANDS,
  BRUSH_SWAY,
  BRUSH_SWAY_WAVES,
  BRUSH_TAIL_CURVE,
  BRUSH_TAIL_SHARE,
  BRUSH_THICKNESS,
  BRUSH_WIDTH,
  BRUSH_WOBBLE_RATE_MIN,
  BRUSH_WOBBLE_RATE_SPREAD,
} from './constants'

function brushThickness(along: number) {
  if (along < BRUSH_PRESS_SHARE) return BRUSH_THICKNESS * Math.sqrt(along / BRUSH_PRESS_SHARE)
  const body = BRUSH_THICKNESS * (1 - BRUSH_BODY_THINNING * along)
  const tailStart = 1 - BRUSH_TAIL_SHARE
  if (along < tailStart) return body
  return body * (1 - (along - tailStart) / BRUSH_TAIL_SHARE) ** BRUSH_TAIL_CURVE
}

const brushCenter = (along: number) =>
  BRUSH_BASELINE -
  BRUSH_RISE * along +
  BRUSH_SWAY * Math.sin(along * Math.PI * 2 * BRUSH_SWAY_WAVES)

function brushStrand(index: number, random: Random) {
  const across = (index + 0.5) / BRUSH_STRANDS - 0.5 + (random() - 0.5) * BRUSH_STRAND_DRIFT
  const isCore = Math.abs(across) < BRUSH_CORE_SHARE
  const end = isCore
    ? BRUSH_CORE_END_MIN + random() * (1 - BRUSH_CORE_END_MIN)
    : BRUSH_EDGE_END_MIN + random() * BRUSH_EDGE_END_SPREAD
  const start = random() * BRUSH_STRAND_START_SPREAD + Math.abs(across) * BRUSH_EDGE_START_DELAY
  const weight = BRUSH_STRAND_WEIGHT_MIN + random() * BRUSH_STRAND_WEIGHT_SPREAD
  const wobbleRate = BRUSH_WOBBLE_RATE_MIN + random() * BRUSH_WOBBLE_RATE_SPREAD
  const wobblePhase = random() * Math.PI * 2
  const pulseRate = BRUSH_PULSE_RATE_MIN + random() * BRUSH_PULSE_RATE_SPREAD
  const pulsePhase = random() * Math.PI * 2
  const pulseDepth =
    BRUSH_PULSE_DEPTH *
    (BRUSH_PULSE_CORE_SHARE + (1 - BRUSH_PULSE_CORE_SHARE) * 2 * Math.abs(across))
  const upper: string[] = []
  const lower: string[] = []

  for (let i = 0; i <= BRUSH_SAMPLES; i++) {
    const along = start + ((end - start) * i) / BRUSH_SAMPLES
    const thickness = brushThickness(along)
    const taper = THREE.MathUtils.smoothstep((end - along) / BRUSH_STRAND_TAPER_SHARE, 0, 1)
    const pulse = 1 - pulseDepth * (0.5 + 0.5 * Math.sin(along * pulseRate + pulsePhase))
    const halfWidth =
      ((thickness * BRUSH_STRAND_OVERLAP) / BRUSH_STRANDS / 2) * taper * weight * pulse
    const wobble = BRUSH_STRAND_WOBBLE * Math.sin(along * wobbleRate + wobblePhase)
    const center = brushCenter(along) + across * thickness + wobble
    const x = (BRUSH_START + along * BRUSH_LENGTH).toFixed(2)
    upper.push(`${x} ${(center - halfWidth).toFixed(2)}`)
    lower.push(`${x} ${(center + halfWidth).toFixed(2)}`)
  }

  return `M${upper.join('L')}L${lower.reverse().join('L')}Z`
}

function buildBrushStroke() {
  const random = seededRandom(BRUSH_SEED)
  return Array.from({ length: BRUSH_STRANDS }, (_, index) => brushStrand(index, random)).join('')
}

export const TITLE_UNDERLINE_BOX = `0 0 ${BRUSH_WIDTH} ${BRUSH_HEIGHT}`
export const TITLE_UNDERLINE = buildBrushStroke()

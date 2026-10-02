import * as THREE from 'three'
import { audio } from '@/audio/audioManager'
import { useCinematicStore } from '@/store/cinematicStore'
import { useSkyBeamStore } from '@/store/skyBeamStore'
import { requestClearSkies } from '@/store/weatherStore'
import { mix } from '@/utils/math'
import { positionIn } from '@/utils/meshes'
import { MAX_FRAME_SECONDS } from '@/utils/time'
import {
  CHARGE_AT,
  DARKEN_SECONDS,
  FIRE_AT,
  FIRE_FLASH_SECONDS,
  FOCUS_BLEND_SECONDS,
  FOCUS_HOLD_SECONDS,
  FOCUS_ZOOM,
  MOTES_FADE_SECONDS,
  MOTES_FORM_SECONDS,
  ORB_FLASH_GLOW,
  ORB_FLASH_GROWTH,
  ORB_PULSE_DEPTH,
  ORB_PULSE_RATE_MAX,
  ORB_PULSE_RATE_MIN,
  ORB_SOURCE_SHARE,
  SHAKE_SECONDS,
  SHAKE_STRENGTH,
  SHOOT_SECONDS,
  SKY_BEAM_ANCHOR_NODE,
  SKY_BEAM_BREATH_DEPTH,
  SKY_BEAM_BREATH_RATE,
  SKY_BEAM_FADE_SECONDS,
  SKY_BEAM_FLASH_GLOW,
  SKY_BEAM_FLASH_WIDEN,
  SKY_BEAM_LINGER_SECONDS,
  SKY_DARKNESS,
  SPARK_STRIKE_RATE,
  SPARKS_FADE_SECONDS,
  SPARKS_FORM_SECONDS,
} from './constants'

const { clamp, smoothstep } = THREE.MathUtils

const CINEMATIC_END = FIRE_AT + FOCUS_HOLD_SECONDS + FOCUS_BLEND_SECONDS
const FADE_START = FIRE_AT + SKY_BEAM_LINGER_SECONDS
const SEQUENCE_END = FADE_START + SKY_BEAM_FADE_SECONDS

export interface SkyBeamAnchor {
  anchor: THREE.Object3D
  origin: THREE.Vector3
}

interface SkyBeamStage {
  sparks: number
  charge: number
  motes: number
  orbSize: number
  orbGlow: number
  reach: number
  beamWidth: number
  beamGlow: number
  risingMotes: number
  presence: number
  focusBlend: number
  shake: number
  isCinematic: boolean
  isOver: boolean
}

interface SkyBeamRun {
  elapsed: number
  pulsePhase: number
  sinceStrike: number
  restoreMusic: (fadeSeconds: number) => void
  stage: SkyBeamStage
}

export function findSkyBeamAnchor(model: THREE.Object3D): SkyBeamAnchor | null {
  const anchor = model.getObjectByName(SKY_BEAM_ANCHOR_NODE)
  if (!anchor) return null
  model.updateMatrixWorld(true)
  return { anchor, origin: positionIn(model, anchor) }
}

export const createSkyBeamRun = (): SkyBeamRun => ({
  elapsed: 0,
  pulsePhase: 0,
  sinceStrike: Infinity,
  restoreMusic: () => {},
  stage: {
    sparks: 0,
    charge: 0,
    motes: 0,
    orbSize: 0,
    orbGlow: 0,
    reach: 0,
    beamWidth: 1,
    beamGlow: 0,
    risingMotes: 0,
    presence: 0,
    focusBlend: 0,
    shake: 0,
    isCinematic: true,
    isOver: false,
  },
})

function stageAt(elapsed: number, pulsePhase: number, stage: SkyBeamStage) {
  const sinceFire = elapsed - FIRE_AT
  const hasFired = sinceFire >= 0
  const fade = 1 - smoothstep(elapsed, FADE_START, SEQUENCE_END)
  const flash = hasFired ? 1 - smoothstep(sinceFire, 0, FIRE_FLASH_SECONDS) : 0
  const pulse = 1 - ORB_PULSE_DEPTH * (0.5 + 0.5 * Math.sin(pulsePhase))
  const breath = 1 - SKY_BEAM_BREATH_DEPTH * (0.5 + 0.5 * Math.sin(elapsed * SKY_BEAM_BREATH_RATE))
  const shot = clamp(sinceFire / SHOOT_SECONDS, 0, 1)
  const settle = clamp(sinceFire / SHAKE_SECONDS, 0, 1)

  stage.charge = smoothstep(elapsed, CHARGE_AT, FIRE_AT)
  stage.sparks =
    smoothstep(elapsed, 0, SPARKS_FORM_SECONDS) *
    (1 - smoothstep(sinceFire, 0, SPARKS_FADE_SECONDS))
  stage.motes =
    smoothstep(elapsed, CHARGE_AT, CHARGE_AT + MOTES_FORM_SECONDS) *
    (1 - smoothstep(sinceFire, 0, MOTES_FADE_SECONDS))
  stage.orbSize = hasFired
    ? mix(ORB_SOURCE_SHARE, 1 + ORB_FLASH_GROWTH, flash) * fade
    : stage.charge
  stage.orbGlow = (hasFired ? (1 + flash * ORB_FLASH_GLOW) * fade : stage.charge) * pulse
  stage.reach = hasFired ? 1 - (1 - shot) ** 3 : 0
  stage.beamWidth = 1 + flash * SKY_BEAM_FLASH_WIDEN
  stage.beamGlow = hasFired ? (1 + flash * SKY_BEAM_FLASH_GLOW) * fade * breath : 0
  stage.risingMotes = smoothstep(sinceFire, 0, SHOOT_SECONDS) * fade
  stage.presence = smoothstep(elapsed, 0, DARKEN_SECONDS) * fade
  stage.focusBlend =
    smoothstep(elapsed, 0, FOCUS_BLEND_SECONDS) *
    (1 - smoothstep(elapsed, CINEMATIC_END - FOCUS_BLEND_SECONDS, CINEMATIC_END))
  stage.shake = hasFired ? SHAKE_STRENGTH * (1 - settle) ** 2 : 0
  stage.isCinematic = elapsed < CINEMATIC_END
  stage.isOver = elapsed >= SEQUENCE_END
}

const reached = (from: number, to: number, moment: number) => from < moment && to >= moment

export function advanceSkyBeam(run: SkyBeamRun, delta: number): boolean {
  const dt = Math.min(delta, MAX_FRAME_SECONDS)
  const previous = run.elapsed
  run.elapsed += dt
  if (reached(previous, run.elapsed, CHARGE_AT)) audio.play('skyBeamCharge')
  if (reached(previous, run.elapsed, FIRE_AT)) audio.play('skyBeamShoot')
  if (reached(previous, run.elapsed, FADE_START)) run.restoreMusic(SKY_BEAM_FADE_SECONDS)
  run.pulsePhase += dt * mix(ORB_PULSE_RATE_MIN, ORB_PULSE_RATE_MAX, run.stage.charge)
  stageAt(run.elapsed, run.pulsePhase, run.stage)

  run.sinceStrike += dt
  if (run.stage.sparks <= 0 || run.sinceStrike < 1 / SPARK_STRIKE_RATE) return false
  run.sinceStrike = 0
  return true
}

export function beginSkyBeam(run: SkyBeamRun, anchor: THREE.Object3D) {
  const cinematic = useCinematicStore.getState()
  anchor.getWorldPosition(cinematic.focus)
  cinematic.focusZoom = FOCUS_ZOOM
  requestClearSkies()
  audio.preload('skyBeamCharge')
  audio.preload('skyBeamShoot')
  run.restoreMusic = audio.silenceMusic(DARKEN_SECONDS)
}

type WorldStage = Pick<SkyBeamStage, 'isCinematic' | 'focusBlend' | 'shake' | 'presence'>

export function applyStage({ isCinematic, focusBlend, shake, presence }: WorldStage) {
  const cinematic = useCinematicStore.getState()
  cinematic.isPlaying = isCinematic
  cinematic.focusBlend = focusBlend
  cinematic.shake = shake
  const skyBeam = useSkyBeamStore.getState()
  skyBeam.presence = presence
  skyBeam.darkness = SKY_DARKNESS * presence
}

export function releaseWorld(run: SkyBeamRun) {
  applyStage({ isCinematic: false, focusBlend: 0, shake: 0, presence: 0 })
  run.restoreMusic(SKY_BEAM_FADE_SECONDS)
}

import type { PulseRingTuning } from '@/world/islands/buildshore/shared/pulse-ring/pulseRingModel'

// ── Model nodes ───────────────────────────────────────────────────────────────
export const MONUMENT_NODE = 'BeeSigned | Signing parchment monument'
export const SIGNATURE_NODE = 'BeeSigned | Signature ink'
export const WAX_SEAL_NODE = 'BeeSigned | Wax seal'
export const HIVE_WINDOW_ROLE = 'hive_architecture'
export const HIVE_WINDOW_DEPTH_STEPS = 1

// ── Signing (seconds, signature lengths) ──────────────────────────────────────
export const SIGN_DELAY_SECONDS = 0.15
export const SIGN_SECONDS = 1.3
export const INK_GLINT_REACH = 0.1
export const INK_GLINT_COLOR = '#ffc94d'
export const INK_GLINT_STRENGTH = 2.2
export const INK_GLINT_FADE_SECONDS = 0.35

// ── Wax seal (seconds, seal-local units) ──────────────────────────────────────
export const SEAL_LIFT = 0.35
export const SEAL_LIFT_SECONDS = 0.3
export const STAMP_AT_SECONDS = 1.6
export const STAMP_SECONDS = 0.12
export const SEAL_IMPACT_SECONDS = 0.22
export const SEAL_SQUASH = 0.18
export const SEAL_GLOW_DAY_SHARE = 0.25
export const SEAL_GLOW_GAIN = 1.2
export const SEAL_RING_REACH = 2.6
export const SEAL_RING: PulseRingTuning = {
  color: '#ffc23d',
  periodSeconds: 1.2,
  rings: 1,
  isRepeating: false,
  width: 0.06,
  trail: 0.3,
  lift: 0.04,
  glow: 0,
}

// ── Bees (model units, seconds) ───────────────────────────────────────────────
export const BEE_COUNT = 5
export const BEE_SIZE = 0.55
export const BEE_EMERGE_SECONDS = 1.1
export const BEE_RETURN_SECONDS = 1.1
export const BEE_EMERGE_STAGGER_SECONDS = 0.25
export const BEE_HIDE_SHARE = 0.12
export const BEE_LOOP_REACH = 2.8
export const BEE_CLEARANCE = 0.8
export const BEE_EXIT_REACH = 1.2
export const BEE_LOOP_RATE = 0.22
export const BEE_BOB = 0.18
export const BEE_BOB_RATE = 3.2
export const BEE_FLAP_RATE = 14
export const BEE_FACING_SECONDS = 0.05
export const BEE_BODY_COLOR = '#ffc62e'
export const BEE_STRIPE_COLOR = '#2b2118'
export const BEE_WING_COLOR = '#ffffff'

// ── Bee trails (model units, seconds) ─────────────────────────────────────────
export const BEE_TRAIL_DOTS = 6
export const BEE_TRAIL_SPACING_SECONDS = 0.07
export const BEE_TRAIL_SIZE = 0.22
export const BEE_TRAIL_COLOR = '#ffd36b'
export const BEE_TRAIL_STRENGTH = 0.9

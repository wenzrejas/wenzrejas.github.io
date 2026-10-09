import type { GroundGlowTuning } from '@/world/islands/shared/ground-glow/glowSites'

// ── Gem halos ─────────────────────────────────────────────────────────────────
export const GEM_HALO_SPREAD = 1.8
export const GEM_HALO_STRENGTH = 0.5

// ── Shrine ground glow ────────────────────────────────────────────────────────
export const SHRINE_GROUND_GLOW: GroundGlowTuning = {
  haloSpread: 1.55,
  haloFill: 0.35,
  haloStrength: 0.55,
  haloLift: 0.3,
  motesPerSite: 16,
  moteSize: 2,
  moteRise: 13,
  moteLifetime: 4.5,
  moteSwirl: 0.9,
  moteSpread: 0.6,
  moteInnerShare: 0.35,
  moteStrength: 1.7,
}

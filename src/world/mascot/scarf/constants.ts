// ── Cloth ─────────────────────────────────────────────────────────────────────
export const SCARF_CLOTH = {
  color: 0xb83c32,
  tailColor: 0xc44736,
  roughness: 0.88,
  lengthSegments: 36,
  widthSegments: 8,
  foldDepth: 0.055,
  foldCount: 1.6,
  foldTwist: 4.8,
}

export const SCARF_BAND = {
  segments: 72,
  heightSegments: 8,
  centerHeight: -0.735,
  height: 0.2,
  topRadius: 0.85,
  bottomRadius: 0.7,
  depth: 0.49,
  frontOffset: -0.04,
  crossSectionExponent: 0.3,
  frontDrop: 0.18,
  foldDepth: 0.023,
  foldCount: 3,
  hemRise: 0.03,
}

export const SCARF_KNOT = {
  position: [-0.78, -0.66, 0.49] as const,
  scale: [0.19, 0.125, 0.105] as const,
  rotation: -0.4,
  segments: 16,
}

// ── Tails ─────────────────────────────────────────────────────────────────────
export const SCARF_TAILS = [
  {
    points: [
      [-0.79, -0.66, 0.46],
      [-1.01, -0.62, 0.42],
      [-1.28, -0.54, 0.34],
      [-1.49, -0.55, 0.33],
      [-1.66, -0.67, 0.42],
    ],
    widths: [0.055, 0.135, 0.19, 0.17, 0.025],
    foldPhase: 0.6,
  },
  {
    points: [
      [-0.79, -0.72, 0.44],
      [-0.99, -0.85, 0.45],
      [-1.22, -0.98, 0.49],
      [-1.43, -1.0, 0.41],
      [-1.55, -1.15, 0.36],
    ],
    widths: [0.055, 0.13, 0.18, 0.15, 0.018],
    foldPhase: 2.3,
  },
] as const

// ── Compass clasp ─────────────────────────────────────────────────────────────
export const SCARF_CLASP = {
  position: [-0.815, -0.745, 0.59] as const,
  gold: 0xe7af48,
  inset: 0x344854,
  roughness: 0.6,
  metalness: 0.28,
  radius: 0.097,
  rimThickness: 0.017,
  insetRadius: 0.085,
  insetDepth: 0.015,
  starRadius: 0.073,
  starInnerRadius: 0.024,
  starDepth: 0.012,
  ringRadius: 0.024,
  ringThickness: 0.009,
  ringHeight: 0.119,
  radialSegments: 10,
  ringSegments: 32,
  rotation: -0.24,
}

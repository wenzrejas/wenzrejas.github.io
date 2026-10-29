export type ShapePoint = readonly [number, number, number]
export type OutlinePoint = readonly [number, number]
export type WhaleStation = readonly [number, number, number]

export interface FlukeLobe {
  leading: OutlinePoint[]
  trailing: OutlinePoint[]
  tip: OutlinePoint
}

interface Flipper {
  leading: ShapePoint[]
  trailing: ShapePoint[]
  tip: ShapePoint
}

// ── Body (along, top, bottom; length 1, snout at +0.5) ────────────────────────
export const WHALE_RING_SEGMENTS = 14
export const WHALE_RING_ROUNDNESS = 0.85
export const WHALE_WIDTH_SHARE = 0.42
export const WHALE_SNOUT: ShapePoint = [0, -0.004, 0.5]
export const WHALE_TAIL_END: ShapePoint = [0, 0.006, -0.372]
export const WHALE_PROFILE: WhaleStation[] = [
  [0.497, 0.009, -0.018],
  [0.489, 0.015, -0.026],
  [0.477, 0.019, -0.033],
  [0.432, 0.026, -0.042],
  [0.387, 0.031, -0.053],
  [0.342, 0.035, -0.064],
  [0.297, 0.04, -0.085],
  [0.251, 0.043, -0.107],
  [0.206, 0.044, -0.128],
  [0.161, 0.044, -0.141],
  [0.116, 0.043, -0.149],
  [0.071, 0.04, -0.153],
  [0.025, 0.035, -0.151],
  [-0.02, 0.029, -0.147],
  [-0.065, 0.024, -0.136],
  [-0.11, 0.019, -0.121],
  [-0.156, 0.015, -0.102],
  [-0.201, 0.011, -0.081],
  [-0.246, 0.01, -0.058],
  [-0.291, 0.012, -0.037],
  [-0.325, 0.017, -0.02],
  [-0.355, 0.021, -0.01],
]

// ── Flukes (along, height) ────────────────────────────────────────────────────
export const WHALE_FLUKE_NOTCH: OutlinePoint = [-0.404, 0.006]
export const WHALE_UPPER_FLUKE: FlukeLobe = {
  leading: [
    [-0.353, 0.021],
    [-0.381, 0.034],
    [-0.415, 0.062],
    [-0.449, 0.088],
  ],
  trailing: [
    [-0.404, 0.006],
    [-0.427, 0.023],
    [-0.449, 0.051],
    [-0.466, 0.079],
  ],
  tip: [-0.485, 0.102],
}
export const WHALE_LOWER_FLUKE: FlukeLobe = {
  leading: [
    [-0.353, -0.01],
    [-0.381, -0.019],
    [-0.415, -0.034],
    [-0.455, -0.051],
  ],
  trailing: [
    [-0.404, 0.006],
    [-0.427, -0.011],
    [-0.449, -0.028],
    [-0.472, -0.044],
  ],
  tip: [-0.5, -0.062],
}

// ── Solid fluke cross-section (shares of the chord and of the thickness) ──────
export const WHALE_FLUKE_RIDGE_AT = 0.35
export const WHALE_FLUKE_LEADING_SHARE = 0.6
export const WHALE_FLUKE_TRAILING_SHARE = 0.15

// ── Pectoral flipper (across, height, along; mirrored; root inside the body) ──
export const WHALE_FLIPPER_ROOT_THICKNESS = 0.022
export const WHALE_FLIPPER_TIP_THICKNESS = 0.005
export const WHALE_FLIPPER: Flipper = {
  leading: [
    [0.03, -0.09, 0.21],
    [0.075, -0.165, 0.17],
    [0.1, -0.225, 0.13],
    [0.122, -0.28, 0.09],
  ],
  trailing: [
    [0.03, -0.115, 0.1],
    [0.08, -0.175, 0.085],
    [0.105, -0.235, 0.065],
    [0.125, -0.285, 0.05],
  ],
  tip: [0.14, -0.325, 0.045],
}

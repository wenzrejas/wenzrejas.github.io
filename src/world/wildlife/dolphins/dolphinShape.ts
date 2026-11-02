export type ShapePoint = readonly [number, number, number]
type ProfilePoint = readonly [number, number]

export interface BodyStation {
  along: number
  top: number
  bottom: number
  halfWidth: number
  bellyLine: number
}

export interface BladeRow {
  leading: ShapePoint
  trailing: ShapePoint
  thickness: number
}

const station = (
  along: number,
  top: number,
  bottom: number,
  halfWidth: number,
  bellyLine: number
): BodyStation => ({ along, top, bottom, halfWidth, bellyLine })

const upright = (leading: ProfilePoint, trailing: ProfilePoint, thickness: number): BladeRow => ({
  leading: [0, leading[1], leading[0]],
  trailing: [0, trailing[1], trailing[0]],
  thickness,
})

const lying = (
  across: number,
  lift: number,
  leading: number,
  trailing: number,
  thickness: number
): BladeRow => ({
  leading: [across, lift, leading],
  trailing: [across, lift, trailing],
  thickness,
})

// ── Rest pose ─────────────────────────────────────────────────────────────────
export const REST_ARCH = 0.35
export const ARCH_START = 0.23

// ── Body (traced from the reference, nose at +0.47) ───────────────────────────
export const BELLY_SEGMENTS = 3
export const BACK_SEGMENTS = 7
export const NOSE: ShapePoint = [0, -0.002, 0.472]
export const TAIL_END: ShapePoint = [0, 0, -0.452]
export const BODY_STATIONS: BodyStation[] = [
  station(0.462, 0.014, -0.018, 0.015, -0.006),
  station(0.454, 0.022, -0.027, 0.023, -0.008),
  station(0.44, 0.028, -0.036, 0.03, -0.012),
  station(0.42, 0.032, -0.045, 0.036, -0.018),
  station(0.398, 0.039, -0.057, 0.043, -0.024),
  station(0.385, 0.058, -0.064, 0.05, -0.028),
  station(0.37, 0.094, -0.071, 0.06, -0.031),
  station(0.355, 0.118, -0.081, 0.07, -0.034),
  station(0.342, 0.134, -0.089, 0.078, -0.036),
  station(0.328, 0.148, -0.099, 0.085, -0.037),
  station(0.3, 0.165, -0.119, 0.096, -0.04),
  station(0.272, 0.176, -0.137, 0.103, -0.046),
  station(0.244, 0.18, -0.153, 0.109, -0.054),
  station(0.207, 0.181, -0.168, 0.114, -0.063),
  station(0.173, 0.179, -0.175, 0.117, -0.07),
  station(0.126, 0.176, -0.176, 0.118, -0.075),
  station(0.063, 0.175, -0.173, 0.115, -0.077),
  station(-0.001, 0.164, -0.163, 0.108, -0.077),
  station(-0.064, 0.149, -0.148, 0.098, -0.074),
  station(-0.127, 0.128, -0.127, 0.083, -0.07),
  station(-0.191, 0.105, -0.104, 0.066, -0.06),
  station(-0.254, 0.082, -0.081, 0.05, -0.047),
  station(-0.318, 0.059, -0.058, 0.035, -0.033),
  station(-0.381, 0.037, -0.035, 0.022, -0.021),
  station(-0.42, 0.024, -0.023, 0.014, -0.014),
  station(-0.445, 0.016, -0.016, 0.01, -0.01),
]

// ── Dorsal fin (along, height; root buried in the back) ───────────────────────
export const DORSAL_ROWS: BladeRow[] = [
  upright([0.06, 0.135], [-0.09, 0.115], 0.036),
  upright([0.02, 0.185], [-0.085, 0.165], 0.032),
  upright([-0.012, 0.218], [-0.083, 0.2], 0.026),
  upright([-0.04, 0.24], [-0.085, 0.228], 0.02),
  upright([-0.06, 0.252], [-0.09, 0.245], 0.015),
]
export const DORSAL_TIP: ShapePoint = [0, 0.255, -0.078]

// ── Pectoral flipper (across, height, along; mirrored; root in the flank) ─────
export const FLIPPER_ROWS: BladeRow[] = [
  { leading: [0.074, -0.055, 0.125], trailing: [0.074, -0.135, 0.055], thickness: 0.03 },
  { leading: [0.108, -0.06, 0.07], trailing: [0.103, -0.15, -0.005], thickness: 0.032 },
  { leading: [0.13, -0.075, 0.005], trailing: [0.126, -0.16, -0.06], thickness: 0.028 },
  { leading: [0.146, -0.095, -0.06], trailing: [0.142, -0.165, -0.105], thickness: 0.022 },
  { leading: [0.155, -0.12, -0.11], trailing: [0.152, -0.165, -0.14], thickness: 0.016 },
]
export const FLIPPER_TIP: ShapePoint = [0.157, -0.15, -0.155]

// ── Flukes (across, lift, leading, trailing; mirrored across the notch) ───────
export const FLUKE_ROWS: BladeRow[] = [
  lying(0, 0, -0.368, -0.458, 0.036),
  lying(0.03, 0, -0.38, -0.47, 0.034),
  lying(0.07, 0.002, -0.402, -0.492, 0.03),
  lying(0.11, 0.005, -0.432, -0.512, 0.024),
  lying(0.15, 0.009, -0.468, -0.527, 0.018),
  lying(0.178, 0.012, -0.5, -0.536, 0.012),
]
export const FLUKE_TIP: ShapePoint = [0.19, 0.014, -0.525]

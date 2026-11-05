import { GHOST_STILL_TANGENT, GHOST_TRACK_STEP, GHOST_TRACK_VALUES_PER_SAMPLE } from '../constants'

export interface GhostPose {
  x: number
  z: number
  heading: number
}

export function recordTrack(track: number[], seconds: number, x: number, z: number) {
  while (track.length / GHOST_TRACK_VALUES_PER_SAMPLE <= seconds / GHOST_TRACK_STEP) {
    track.push(Math.round(x), Math.round(z))
  }
}

const catmullRom = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 *
  (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t)

const catmullRomSlope = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (c - a + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (3 * b - a - 3 * c + d) * t * t)

export function poseTrack(track: number[], seconds: number, out: GhostPose) {
  const samples = track.length / GHOST_TRACK_VALUES_PER_SAMPLE
  const place = Math.min(seconds / GHOST_TRACK_STEP, samples - 1)
  const from = Math.min(Math.floor(place), samples - 2)
  const t = place - from
  const before = Math.max(from - 1, 0) * GHOST_TRACK_VALUES_PER_SAMPLE
  const start = from * GHOST_TRACK_VALUES_PER_SAMPLE
  const end = (from + 1) * GHOST_TRACK_VALUES_PER_SAMPLE
  const after = Math.min(from + 2, samples - 1) * GHOST_TRACK_VALUES_PER_SAMPLE
  out.x = catmullRom(track[before], track[start], track[end], track[after], t)
  out.z = catmullRom(track[before + 1], track[start + 1], track[end + 1], track[after + 1], t)
  const slopeX = catmullRomSlope(track[before], track[start], track[end], track[after], t)
  const slopeZ = catmullRomSlope(
    track[before + 1],
    track[start + 1],
    track[end + 1],
    track[after + 1],
    t
  )
  if (Math.hypot(slopeX, slopeZ) > GHOST_STILL_TANGENT) out.heading = Math.atan2(slopeX, slopeZ)
}

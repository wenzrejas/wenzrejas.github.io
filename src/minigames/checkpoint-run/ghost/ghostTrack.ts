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

const catmullRom = (before: number, start: number, end: number, after: number, share: number) =>
  0.5 *
  (2 * start +
    (end - before) * share +
    (2 * before - 5 * start + 4 * end - after) * share * share +
    (3 * start - before - 3 * end + after) * share * share * share)

const catmullRomSlope = (
  before: number,
  start: number,
  end: number,
  after: number,
  share: number
) =>
  0.5 *
  (end -
    before +
    2 * (2 * before - 5 * start + 4 * end - after) * share +
    3 * (3 * start - before - 3 * end + after) * share * share)

export function poseTrack(track: number[], seconds: number, out: GhostPose) {
  const samples = track.length / GHOST_TRACK_VALUES_PER_SAMPLE
  const place = Math.min(seconds / GHOST_TRACK_STEP, samples - 1)
  const from = Math.min(Math.floor(place), samples - 2)
  const share = place - from
  const before = Math.max(from - 1, 0) * GHOST_TRACK_VALUES_PER_SAMPLE
  const start = from * GHOST_TRACK_VALUES_PER_SAMPLE
  const end = (from + 1) * GHOST_TRACK_VALUES_PER_SAMPLE
  const after = Math.min(from + 2, samples - 1) * GHOST_TRACK_VALUES_PER_SAMPLE
  out.x = catmullRom(track[before], track[start], track[end], track[after], share)
  out.z = catmullRom(track[before + 1], track[start + 1], track[end + 1], track[after + 1], share)
  const slopeX = catmullRomSlope(track[before], track[start], track[end], track[after], share)
  const slopeZ = catmullRomSlope(
    track[before + 1],
    track[start + 1],
    track[end + 1],
    track[after + 1],
    share
  )
  if (Math.hypot(slopeX, slopeZ) > GHOST_STILL_TANGENT) out.heading = Math.atan2(slopeX, slopeZ)
}

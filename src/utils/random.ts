export type Random = () => number

export const randomBetween = (random: Random) => (min: number, max: number) =>
  min + (max - min) * random()

export function pickByShare<T extends { share: number }>(entries: readonly T[], roll: number): T {
  let reach = 0
  for (const entry of entries) {
    reach += entry.share
    if (roll < reach) return entry
  }
  return entries[entries.length - 1]
}

export function seededRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), state | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

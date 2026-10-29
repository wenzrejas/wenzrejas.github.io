import type { AchievementCategory, AchievementKey, RankKey } from '@/achievements/constants'
import type { LiveryKey } from '@/world/ship/constants'

interface AchievementText {
  title: string
  description: string
}

// ── Achievements ──────────────────────────────────────────────────────────────
export const ACHIEVEMENT_COPY: Record<AchievementKey, AchievementText> = {
  anchorsAweigh: { title: 'Anchors Aweigh', description: 'Set sail for the first time' },
  landHo: { title: 'Land Ho!', description: 'Discover your first island' },
  cartographer: { title: 'Cartographer', description: 'Discover all five islands' },
  windrider: { title: 'Windrider', description: 'Catch a wind current' },
  chartedCourse: { title: 'Charted Course', description: 'Set sail from the world map' },
  edgeOfTheWorld: {
    title: 'Edge of the World',
    description: 'Sail into the mist at the edge of the sea',
  },
  signalSent: { title: 'Signal Sent', description: 'Send a message from the Lumina lighthouse' },
  followingTheLights: {
    title: 'Following the Lights',
    description: "Follow a monolith's link at Lumina Point",
  },
  coffeeBreak: { title: 'Coffee Break', description: 'Stop by the café on Cozy Isle' },
  groveKeeper: { title: 'Grove Keeper', description: 'Visit all four Tech Grove statues' },
  masterBuilder: { title: 'Master Builder', description: 'Explore all six Buildshore projects' },
  closerLook: { title: 'Closer Look', description: 'Open a project screenshot up close' },
  intoTheDeep: { title: 'Into the Deep', description: 'Dive through the Timewell Depth' },
  journeysEnd: {
    title: "Journey's End",
    description: 'Reach the clock at the bottom of the depths',
  },
  turnBackTime: { title: 'Turn Back Time', description: 'Surface by rewinding the clock' },
  podPals: { title: 'Pod Pals', description: 'Sail alongside a pod of dolphins' },
  tharSheBlows: { title: 'Thar She Blows!', description: 'Witness a whale breach' },
  glowingWaters: { title: 'Glowing Waters', description: 'Sail through glowing algae' },
  weatheredTheStorm: { title: 'Weathered the Storm', description: 'Keep sailing through the rain' },
  stargazer: { title: 'Stargazer', description: 'Sail under a clear, starry night' },
  dawnPatrol: { title: 'Dawn Patrol', description: 'Watch the sun rise at sea' },
  scenicRoute: { title: 'Scenic Route', description: 'Sail a full circle' },
  becalmed: { title: 'Becalmed', description: 'Let the ship sit still for a while' },
  oldFriend: { title: 'Old Friend', description: 'Come back for another voyage' },
  legendOfTheSeas: { title: 'Legend of the Seas', description: 'Earn every other achievement' },
}

// ── Ranks and liveries ────────────────────────────────────────────────────────
export const RANK_NAMES: Record<RankKey, string> = {
  stowaway: 'Stowaway',
  deckhand: 'Deckhand',
  navigator: 'Navigator',
  firstMate: 'First Mate',
  captain: 'Captain',
  legend: 'Legend of the Seas',
}

export const LIVERY_NAMES: Record<LiveryKey, string> = {
  original: 'Original',
  seafoam: 'Seafoam',
  crimson: 'Crimson Corsair',
  midnight: 'Midnight',
  royal: 'Royal',
  gilded: 'Gilded',
}

// ── Achievements tab ──────────────────────────────────────────────────────────
export const ACHIEVEMENTS_TAB_COPY = {
  categories: {
    voyage: 'Voyage',
    islands: 'The Islands',
    depths: 'Timewell Depths',
    seaAndSky: 'Sea & Sky',
    oddMoments: 'Odd Moments',
  } satisfies Record<AchievementCategory, string>,
  secret: { title: '???', description: 'A secret of the sea' },
  rank: 'Rank',
  tally: (done: number, total: number) => `${done} / ${total}`,
  nextRank: (needed: number, rank: string) => `${needed} more to ${rank}`,
  topRank: 'The highest rank on these seas',
  liveries: 'Ship colors',
  lockedLivery: (rank: string) => `Unlocks at ${rank}`,
  earned: 'Earned',
  notEarned: 'Not yet earned',
  legendNote: {
    heading: 'A note from Wenz',
    lines: [
      "You've sailed every corner of this little world. Thank you for exploring it so thoroughly.",
      "If you've made it this far, I'd love to hear from you. The lighthouse at Lumina Point is always lit.",
    ],
  },
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export const ACHIEVEMENT_TOAST_COPY = {
  eyebrow: 'Achievement unlocked',
}

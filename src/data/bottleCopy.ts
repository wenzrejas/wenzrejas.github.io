import type { BottleKey, BottlePanel } from '@/minigames/message-in-a-bottle/bottleSpots'
import { ISLAND_COPY, PROJECT_COPY } from './islandCopy'

interface BottleNote {
  title: string
  text: string
}

export const BOTTLE_NOTES: Record<BottleKey, BottleNote> = {
  whySea: {
    title: 'Why a sea?',
    text: 'Grand RPG adventures and stories of ocean voyages are why this is a sea and not a scrolling page. Chrono Trigger, Final Fantasy 6, and One Piece started it all. I wanted you to be able to get a little lost in my work.',
  },
  dayOne: {
    title: 'Day one',
    text: "The first commit to this world is dated May 2, 2026. Cozy Isle was the first island to make it onto the map. Fitting, since that's where the coffee is.",
  },
  meetTheVoyager: {
    title: 'Meet the Voyager',
    text: "The ship is called the Voyager. You've been steering it all this time, so it seemed only fair to introduce you.",
  },
  whereItStarted: {
    title: 'Where it started',
    text: "My first developer job was building WordPress sites at LogicBase in 2017. The tools have changed a lot since then. The job of making a page work on every screen hasn't.",
  },
  stillTicking: {
    title: 'Still ticking',
    text: "The clock at the bottom of the Timewell keeps real time: yours, read from your device. It's ticking down there right now. Go and check if you don't believe me.",
  },
  homePort: {
    title: 'Home port',
    text: "My first three developer jobs were all in Cagayan de Oro City, Philippines. I've since worked with teams much farther away, but that's where I learned to steer.",
  },
  nightOwl: {
    title: 'Night owl',
    text: "My commit history gives me away. Friday is the busiest day on this world, and a fair few commits landed after midnight. Cozy Isle's kettle isn't just decoration.",
  },
  stillOnTheMap: {
    title: 'Still on the map',
    text: 'BeeSigned was retired on March 25, 2024, after years of helping Australian businesses go paperless. The app is gone, but it kept its place on Buildshore. It earned it.',
  },
  homework: {
    title: 'Homework',
    text: 'If you liked this sea, blame Bruno Simon. His course, Three.js Journey, is where I learned to build it, and his portfolio showed me how far it can go. Go drive around it.',
  },
  aTip: {
    title: 'A tip',
    text: "You don't have to wait for nightfall. Open Settings and pick the time of day yourself. Visit the islands after dark at least once. That's when their lights come on.",
  },
  offTheClock: {
    title: 'Off the clock',
    text: "When I'm not at a keyboard, I'm usually playing with my sweet little daughter who also loves the sea.",
  },
  asleep: {
    title: 'Asleep',
    text: "There's a humpback whale in this sea. I spent a long time getting its breach right, then told it to stay down. If you ever see it, I changed my mind.",
  },
  foundThemAll: {
    title: 'You found them all',
    text: "You found all twelve. I honestly wasn't sure anyone would. If you've read this far, I'd like to hear from you, whether it's a project, a role, or just a hello. The lighthouse is right there, and it really does reach me.",
  },
}

export const BOTTLE_LINKS: Partial<Record<BottleKey, { label: string; url: string }>> = {
  homework: { label: "Visit Bruno's Portfolio", url: 'https://bruno-simon.com/' },
}

export const BOTTLE_COPY = {
  count: (found: number, total: number) => `Bottle ${found} of ${total}`,
  lastBottle: 'The last bottle',
  signature: 'Wenz',
}

export const bottlePanelLabel = (panel: BottlePanel) =>
  panel === 'contact' ? ISLAND_COPY.lumina.marker : PROJECT_COPY[panel]

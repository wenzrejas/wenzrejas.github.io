import type { MascotMood } from '@/guide/mascot/constants'

export interface DialoguePage {
  mood: MascotMood
  heading?: string
  lines: string[]
}

// ── Introduction ──────────────────────────────────────────────────────────────
const A_NEW_VISITOR: DialoguePage[] = [
  {
    mood: 'surprised',
    heading: 'Oh! A visitor!',
    lines: ["I wasn't expecting company!"],
  },
  {
    mood: 'happy',
    lines: ["I'm Wobbi, your trusty little navigator.", 'Well... mostly trusty.'],
  },
]

const MEET_THE_CREATOR: DialoguePage[] = [
  {
    mood: 'curious',
    lines: ['Say, have you met the one who created this place?'],
  },
  {
    mood: 'talking',
    lines: [
      'This world belongs to Wenz Louie Rejas, a frontend developer who loves turning creative ideas into interactive experiences.',
    ],
  },
  {
    mood: 'happy',
    lines: [
      "He's inspired by grand RPG adventures and stories of sailing across vast oceans.",
      'So he built a little world where you can explore his projects, skills, and journey as a developer!',
    ],
  },
]

const LEARN_TO_SAIL: DialoguePage[] = [
  {
    mood: 'excited',
    heading: 'Ready to explore?',
    lines: ['Let me show you the ropes!'],
  },
  {
    mood: 'talking',
    lines: [
      'Use [W] or [↑] to move forward, [S] or [↓] to reverse, and [A] or [←] / [D] or [→] to steer.',
    ],
  },
  {
    mood: 'curious',
    lines: [
      'Keep an eye out for wind currents, too.',
      'They can give our little ship a helpful boost!',
    ],
  },
  {
    mood: 'happy',
    lines: [
      'And if you get lost, just open the world map.',
      'Even seasoned explorers need a little guidance!',
    ],
  },
]

const SET_SAIL: DialoguePage[] = [
  {
    mood: 'curious',
    heading: 'Well, where shall we go first?',
    lines: ['Each island has a story waiting to be discovered.'],
  },
  {
    mood: 'happy',
    heading: 'Come on!',
    lines: ["Let's see where the horizon takes us!"],
  },
]

// ── Returning visitors ────────────────────────────────────────────────────────
const WELCOME_BACK: DialoguePage[] = [
  {
    mood: 'happy',
    lines: [
      'Oh, hello again!',
      "It's nice to see you back.",
      'Shall we pick up where we left off?',
    ],
  },
]

// ── Remarks (day and night) ───────────────────────────────────────────────────
const SUNRISE: DialoguePage[] = [
  {
    mood: 'happy',
    lines: ['Look at that morning light.', 'A lovely day for a little exploring.'],
  },
]

const SUNSET: DialoguePage[] = [
  {
    mood: 'curious',
    lines: ["The sun's heading down already?", "Time does fly when you're out at sea."],
  },
]

const NIGHTFALL: DialoguePage[] = [
  {
    mood: 'happy',
    lines: [
      'Everything feels a little different at night.',
      'Keep an eye out for the glowing lights.',
    ],
  },
]

const STARRY_NIGHT: DialoguePage[] = [
  {
    mood: 'curious',
    lines: ['So many stars tonight.', "I wonder how many stories they've watched unfold."],
  },
]

// ── Remarks (weather and sea) ─────────────────────────────────────────────────
const RAIN_BEGINS: DialoguePage[] = [
  {
    mood: 'surprised',
    lines: ['Oh, a little rain!', "Nothing we can't handle."],
  },
]

const RAIN_CONTINUES: DialoguePage[] = [
  {
    mood: 'talking',
    lines: ["There's something rather peaceful about sailing in the rain, isn't there?"],
  },
]

const RAIN_STOPS: DialoguePage[] = [
  {
    mood: 'happy',
    lines: ['Ah, the skies are clearing.', "That's nice."],
  },
]

const GLOWING_ALGAE: DialoguePage[] = [
  {
    mood: 'surprised',
    lines: ['Oh, look at the water!', "It's glowing.", "Isn't that lovely?"],
  },
]

const RIDING_THE_WIND: DialoguePage[] = [
  {
    mood: 'surprised',
    lines: ["Ah, you've caught the wind!", "It'll give our little ship a nice speed boost."],
  },
]

// ── Remarks (voyage) ──────────────────────────────────────────────────────────
const SAILING_FOR_A_WHILE: DialoguePage[] = [
  {
    mood: 'curious',
    lines: ["I wonder what we'll find beyond the next wave..."],
  },
]

const FAMILIAR_ISLAND: DialoguePage[] = [
  {
    mood: 'happy',
    lines: ["Ah, we're back here!", 'Feel free to have another look around.'],
  },
]

const SAILING_IN_CIRCLES: DialoguePage[] = [
  {
    mood: 'confused',
    lines: [
      'Hmm, this view looks rather familiar.',
      'Oh well, no harm in taking the scenic route!',
    ],
  },
]

const STAYING_IDLE: DialoguePage[] = [
  {
    mood: 'idle',
    lines: ['Taking a little break?', "That's alright.", "I'll keep an eye on things."],
  },
]

// ── Remarks (world map) ───────────────────────────────────────────────────────
const OPENED_WORLD_MAP: DialoguePage[] = [
  {
    mood: 'talking',
    lines: ["Here's our map!", 'It should help us find our way around these waters.'],
  },
]

// ── Remarks (island reveals) ──────────────────────────────────────────────────
const REACHED_BUILDSHORE: DialoguePage[] = [
  {
    mood: 'curious',
    lines: [
      "Oh, we've reached Buildshore!",
      'This is where Wenz brings his ideas to life.',
      "Have a look around—there's quite a bit to discover.",
    ],
  },
]

const REACHED_TECH_GROVE: DialoguePage[] = [
  {
    mood: 'happy',
    lines: [
      'Welcome to Tech Grove!',
      'Those statues represent the tools and technologies Wenz works with.',
      'Shall we take a closer look?',
    ],
  },
]

const REACHED_TIMEWELL: DialoguePage[] = [
  {
    mood: 'curious',
    lines: [
      'Ah, the Timewell Depth.',
      "It holds stories from Wenz's journey as a developer.",
      'Curious how it all began?',
      "Let's dive deeper.",
    ],
  },
]

const REACHED_LUMINA_POINT: DialoguePage[] = [
  {
    mood: 'happy',
    lines: [
      "There's Lumina Point!",
      'That lighthouse helps visitors reach Wenz.',
      "If you'd like to say hello, this is the place.",
    ],
  },
]

const REACHED_COZY_ISLE: DialoguePage[] = [
  {
    mood: 'happy',
    lines: [
      'Welcome to Cozy Isle!',
      'A quiet little place for kind gestures.',
      "If you'd like to support Wenz and his creations, you can do that here.",
    ],
  },
]

// ── Depths ────────────────────────────────────────────────────────────────────
const ARRIVED_IN_DEPTHS: DialoguePage[] = [
  {
    mood: 'excited',
    lines: [
      'Here we are!',
      "This is where Wenz's journey as a developer unfolds.",
      'Every stop tells a story of learning, building, and growing.',
      'Shall we take a look?',
    ],
  },
]

const LANDED_AT_THE_CLOCK: DialoguePage[] = [
  {
    mood: 'achievement',
    lines: [
      "And that's a little glimpse into Wenz's journey!",
      'Every experience has helped shape where he is today.',
      'I wonder what the next chapter holds!',
    ],
  },
  {
    mood: 'excited',
    lines: [
      'Ready to head back up?',
      "There's still so much to explore out there.",
      "Come on, our adventure isn't over yet!",
    ],
  },
]

// ── Dialogues ─────────────────────────────────────────────────────────────────
const REMARKS = {
  welcomeBack: WELCOME_BACK,
  sunrise: SUNRISE,
  sunset: SUNSET,
  nightfall: NIGHTFALL,
  starryNight: STARRY_NIGHT,
  rainBegins: RAIN_BEGINS,
  rainContinues: RAIN_CONTINUES,
  rainStops: RAIN_STOPS,
  glowingAlgae: GLOWING_ALGAE,
  ridingTheWind: RIDING_THE_WIND,
  sailingForAWhile: SAILING_FOR_A_WHILE,
  familiarIsland: FAMILIAR_ISLAND,
  sailingInCircles: SAILING_IN_CIRCLES,
  stayingIdle: STAYING_IDLE,
  openedWorldMap: OPENED_WORLD_MAP,
  reachedBuildshore: REACHED_BUILDSHORE,
  reachedTechGrove: REACHED_TECH_GROVE,
  reachedTimewell: REACHED_TIMEWELL,
  reachedLuminaPoint: REACHED_LUMINA_POINT,
  reachedCozyIsle: REACHED_COZY_ISLE,
} satisfies Record<string, DialoguePage[]>

export const DIALOGUES = {
  introduction: [...A_NEW_VISITOR, ...MEET_THE_CREATOR, ...LEARN_TO_SAIL, ...SET_SAIL],
  arrivedInDepths: ARRIVED_IN_DEPTHS,
  landedAtTheClock: LANDED_AT_THE_CLOCK,
  ...REMARKS,
} satisfies Record<string, DialoguePage[]>

export type DialogueKey = keyof typeof DIALOGUES
export type RemarkKey = keyof typeof REMARKS

// ── Dialogue box ──────────────────────────────────────────────────────────────
export const GUIDE_COPY = {
  name: 'Wobbi',
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  pages: 'Dialogue pages',
}

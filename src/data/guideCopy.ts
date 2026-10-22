import type { MascotMood } from '@/guide/mascot/constants'

export interface DialoguePage {
  mood: MascotMood
  heading?: string
  lines: string[]
}

// ── Introduction ──────────────────────────────────────────────────────────────
const WELCOME_ABOARD: DialoguePage[] = [
  {
    mood: 'surprised',
    heading: 'Oh! A visitor!',
    lines: ["I wasn't expecting company!"],
  },
  {
    mood: 'happy',
    heading: "I'm Wobbi!",
    lines: ['Your trusty little navigator.', 'Well... mostly trusty.'],
  },
  {
    mood: 'curious',
    lines: ['Say, have you met the one who created this place?'],
  },
  {
    mood: 'excited',
    lines: [
      'This whole world was dreamed up by Wenz Louie Rejas!',
      "He's a frontend developer who loves turning creative ideas into interactive digital experiences.",
    ],
  },
  {
    mood: 'talking',
    lines: [
      'He builds websites and web applications, bringing designs to life with code, creativity, and a little bit of magic!',
    ],
  },
  {
    mood: 'happy',
    lines: [
      'Every island here tells a part of his story.',
      'His projects, skills, experiences, and even a little about the person behind the code!',
    ],
  },
]

const LEARNING_TO_SAIL: DialoguePage[] = [
  {
    mood: 'excited',
    heading: 'Now, how about we explore?',
    lines: ['But first, let me show you how to sail!'],
  },
  {
    mood: 'talking',
    lines: ['Use [W] or [↑] to sail forward, and [S] or [↓] to reverse.'],
  },
  {
    mood: 'talking',
    lines: ['Use [A] or [←] and [D] or [→] to steer left and right.', 'Easy, right?'],
  },
  {
    mood: 'curious',
    heading: 'See an island that catches your eye?',
    lines: ["Sail closer to discover what it's hiding!"],
  },
  {
    mood: 'happy',
    heading: 'Feeling a little lost?',
    lines: ['Open your map to see the islands and find your way!'],
  },
]

const BEGIN_THE_ADVENTURE: DialoguePage[] = [
  {
    mood: 'curious',
    heading: 'Ready to explore?',
    lines: ["There's a whole world waiting out there!"],
  },
  {
    mood: 'excited',
    heading: 'Come on, captain!',
    lines: ["Let's set sail!"],
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
  introduction: [...WELCOME_ABOARD, ...LEARNING_TO_SAIL, ...BEGIN_THE_ADVENTURE],
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

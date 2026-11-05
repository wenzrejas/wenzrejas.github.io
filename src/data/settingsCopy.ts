import type { Channel } from '@/audio/sounds'
import type {
  ChosenTime,
  ChosenWeather,
  DayLength,
  FrameRateLimit,
  GraphicsQuality,
  SailingSpeed,
  WildlifeActivity,
} from '@/store/settingsStore'

interface CreditLink {
  label: string
  url: string
}

export type CreditName = string | CreditLink

interface CreditGroup {
  heading: string
  names: CreditName[]
}

interface ControlHint {
  keys: string
  action: string
}

export const SETTINGS_COPY = {
  title: 'Settings',
  subtitle: 'Trim the sails',
  switch: { on: 'On', off: 'Off' },
  general: {
    tab: 'General',
    sound: 'Sound',
    allSound: 'All sound',
    display: 'Display',
    volumes: {
      music: 'Music',
      ambience: 'Ambience',
      sfx: 'Effects',
    } satisfies Record<Channel, string>,
    volumeValue: (volume: number) => `${Math.round(volume * 100)}%`,
    graphics: 'Graphics',
    graphicsChoices: {
      smooth: 'Smooth',
      sharp: 'Sharp',
    } satisfies Record<GraphicsQuality, string>,
    frameRateLimit: 'Frame rate',
    frameRateLimitChoices: {
      thirty: '30',
      sixty: '60',
      unlimited: 'Unlimited',
    } satisfies Record<FrameRateLimit, string>,
    fullscreen: 'Full screen',
    hud: 'Show HUD',
    reduceMotion: 'Reduce motion',
    reduceFlashing: 'Reduce flashing',
  },
  world: {
    tab: 'World',
    sailingSpeed: 'Sailing speed',
    sailingChoices: {
      leisurely: 'Leisurely',
      normal: 'Normal',
      brisk: 'Brisk',
    } satisfies Record<SailingSpeed, string>,
    timeOfDay: 'Time of day',
    timeChoices: {
      auto: 'Auto',
      sunrise: 'Sunrise',
      noon: 'Noon',
      sunset: 'Sunset',
      night: 'Night',
    } satisfies Record<ChosenTime, string>,
    weather: 'Weather',
    weatherChoices: {
      auto: 'Auto',
      sunny: 'Clear',
      cloudy: 'Cloudy',
      rainy: 'Rainy',
      windy: 'Windy',
    } satisfies Record<ChosenWeather, string>,
    dayLength: 'Day length',
    dayLengthChoices: {
      short: 'Short',
      normal: 'Normal',
      long: 'Long',
    } satisfies Record<DayLength, string>,
    wildlife: 'Wildlife',
    wildlifeChoices: {
      calm: 'Calm',
      normal: 'Normal',
      lively: 'Lively',
    } satisfies Record<WildlifeActivity, string>,
    remarks: 'Wobbi remarks',
    progress: 'Progress & settings',
    resetProgress: 'Reset',
    confirmReset: 'Reset & reload',
    cancelReset: 'Cancel',
  },
  controls: {
    tab: 'Controls',
    hints: [
      { keys: '[W][A][S][D] • [Arrow] keys • [Drag] on the sea', action: 'Sail the ship' },
      { keys: '[Click] • [Enter]', action: 'Open a marker' },
      { keys: '[Esc]', action: 'Close a panel' },
      { keys: '[Esc]', action: 'Abandon a race' },
      { keys: '[R]', action: 'Restart a race' },
      { keys: '[Scroll] • [W][S] • [↑][↓]', action: 'Travel the depths' },
    ] satisfies ControlHint[],
    touchHints: [
      { keys: '[Drag] on the sea', action: 'Sail the ship' },
      { keys: '[Tap] a marker', action: 'Open a marker' },
      { keys: '[Tap] the close button', action: 'Close a panel' },
      { keys: '[Swipe] up or down', action: 'Travel the depths' },
    ] satisfies ControlHint[],
  },
  achievements: {
    tab: 'Achievements',
  },
  keepsakes: {
    tab: 'Keepsakes',
    bottles: 'Bottles',
    stillAfloat: 'Still out at sea',
    lastBottleHint: 'One more, by the lighthouse at Lumina Point',
  },
  regatta: {
    tab: 'Regatta',
  },
  about: {
    tab: 'About',
    nameSeparator: ' · ',
    description:
      'Every island has a story, and every journey leaves something behind. This little world is a reflection of my journey as a developer — built with curiosity, shaped by experimentation, and brought to life through code. Take the helm and explore.',
    credits: [
      {
        heading: 'Built With',
        names: [
          'Three.js',
          'React',
          'React Three Fiber',
          'Drei',
          'React Spring',
          'Zustand',
          'Blender',
          'Photoshop',
        ],
      },
      { heading: 'Sound Effects', names: ['Pixabay'] },
      { heading: 'Music', names: [{ label: 'Kounine', url: 'https://linktr.ee/Kounine' }] },
      {
        heading: 'Special Thanks',
        names: [{ label: 'Three.js Journey by Bruno Simon', url: 'https://threejs-journey.com/' }],
      },
    ] satisfies CreditGroup[],
  },
}

import type { Channel } from '@/audio/sounds'
import type {
  ChosenTime,
  ChosenWeather,
  DayLength,
  GraphicsQuality,
  SailingSpeed,
  WildlifeActivity,
} from '@/store/settingsStore'

interface CreditGroup {
  heading: string
  names: string[]
}

interface ControlHint {
  keys: string
  action: string
}

export const SETTINGS_COPY = {
  title: 'Settings',
  subtitle: 'Trim the sails',
  switch: { on: 'On', off: 'Off' },
  sound: {
    tab: 'Sound',
    toggle: 'Sound',
    volumes: {
      music: 'Music',
      ambience: 'Ambience',
      sfx: 'Effects',
    } satisfies Record<Channel, string>,
    volumeValue: (volume: number) => `${Math.round(volume * 100)}%`,
  },
  display: {
    tab: 'Display',
    graphics: 'Graphics',
    graphicsChoices: {
      smooth: 'Smooth',
      sharp: 'Sharp',
    } satisfies Record<GraphicsQuality, string>,
    hud: 'Show HUD',
    reduceMotion: 'Reduce motion',
    reduceFlashing: 'Reduce flashing',
  },
  world: {
    tab: 'World',
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
    progress: 'Progress',
    resetProgress: 'Reset',
    confirmReset: 'Reset & reload',
    cancelReset: 'Cancel',
  },
  controls: {
    tab: 'Controls',
    sailingSpeed: 'Sailing speed',
    sailingChoices: {
      leisurely: 'Leisurely',
      normal: 'Normal',
      brisk: 'Brisk',
    } satisfies Record<SailingSpeed, string>,
    hints: [
      { keys: '[W][A][S][D] or [↑][←][↓][→]', action: 'Sail the ship' },
      { keys: 'Click or [Enter]', action: 'Open a marker' },
      { keys: '[Esc]', action: 'Close a panel' },
      { keys: 'Scroll, [W][S] or [↑][↓]', action: 'Travel the depths' },
    ] satisfies ControlHint[],
  },
  achievements: {
    tab: 'Achievements',
  },
  about: {
    tab: 'About',
    nameSeparator: ' · ',
    description:
      'A hand-built sea to sail through. Each island holds a part of my story: the work I have made, the tools I use, and a lighthouse to send me a message.',
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
      { heading: 'Music', names: ['Pixabay'] },
      { heading: 'Sound Effects', names: ['Pixabay'] },
      { heading: 'Special Thanks', names: ['Three.js Journey by Bruno Simon'] },
    ] satisfies CreditGroup[],
  },
}

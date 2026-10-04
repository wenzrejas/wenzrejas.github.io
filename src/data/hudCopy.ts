import type { WeatherType } from '@/store/weatherStore'

export const COMPASS_COPY = {
  points: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
}

export const MINIMAP_COPY = {
  north: 'N',
}

export const WEATHER_COPY = {
  names: {
    sunny: 'Sunny',
    moonlit: 'Clear',
    cloudy: 'Cloudy',
    rainy: 'Rainy',
    windy: 'Windy',
  } satisfies Record<WeatherType, string>,
  wind: 'WIND:',
  windDirections: [
    'NORTH',
    'NORTHEAST',
    'EAST',
    'SOUTHEAST',
    'SOUTH',
    'SOUTHWEST',
    'WEST',
    'NORTHWEST',
  ],
}

export const MENU_COPY = {
  label: 'Game menu',
  mute: 'Mute sound',
  unmute: 'Unmute sound',
  hideHud: 'Hide HUD',
  showHud: 'Show HUD',
  settings: 'Settings',
}

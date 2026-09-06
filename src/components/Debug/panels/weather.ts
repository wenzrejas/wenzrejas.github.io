import { useControls } from 'leva'
import type { WeatherControls } from '../types'

export function useWeatherControls() {
  return useControls(
    'Weather',
    {
      weatherEnabled: { value: true, label: 'enabled' },
      weatherType: {
        value: 'auto',
        options: ['auto', 'sunny', 'cloudy', 'rainy', 'windy', 'moonlit'],
        label: 'type',
      },
    },
    { collapsed: true }
  ) as WeatherControls
}

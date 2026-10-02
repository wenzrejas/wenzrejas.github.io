import { useControls } from 'leva'
import { useDebugStore } from '@/store/debugStore'
import type { WeatherControls } from '../types'

const DEFAULTS = useDebugStore.getInitialState().weather

export function useWeatherControls() {
  return useControls(
    'Weather',
    {
      weatherEnabled: { value: DEFAULTS.weatherEnabled, label: 'enabled' },
      weatherType: {
        value: DEFAULTS.weatherType,
        options: ['auto', 'sunny', 'cloudy', 'rainy', 'windy', 'moonlit'],
        label: 'type',
      },
    },
    { collapsed: true }
  ) as WeatherControls
}

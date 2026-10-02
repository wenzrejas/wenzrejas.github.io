import { useWeatherStore } from '@/store/weatherStore'
import { nightGlow } from '../shared/nightGlow'

export const fireGlow = () => nightGlow() * (1 - useWeatherStore.getState().rainIntensity)

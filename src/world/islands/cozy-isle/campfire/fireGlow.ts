import { useWeatherStore } from '@/store/weatherStore'
import { nightGlow } from '@/world/islands/shared/nightGlow'

export const fireGlow = () => nightGlow() * (1 - useWeatherStore.getState().rainIntensity)

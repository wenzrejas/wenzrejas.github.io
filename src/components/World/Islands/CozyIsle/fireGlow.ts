import { useWeatherStore } from '../../../../store/weatherStore'
import { nightGlow } from '../nightGlow'

export const fireGlow = () => nightGlow() * (1 - useWeatherStore.getState().rainIntensity)

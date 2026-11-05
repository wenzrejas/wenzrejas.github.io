import { useWeatherStore } from '@/store/weatherStore'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'

interface BobTuning {
  baseY: number
  bobAmplitude: number
  bobSpeed: number
}

export const shipBobHeight = (
  { baseY, bobAmplitude, bobSpeed }: BobTuning,
  time: number,
  x: number,
  z: number
) =>
  baseY +
  Math.sin(time * bobSpeed) * bobAmplitude * useWeatherStore.getState().waveAmplitudeMultiplier -
  whirlpoolDip(x, z)

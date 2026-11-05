import { useWeatherStore } from '@/store/weatherStore'
import { whirlpoolDip } from '../islands/timewell-depth/whirlpoolFunnel'

interface BobTuning {
  baseY: number
  bobAmp: number
  bobSpeed: number
}

export const shipBobHeight = (
  { baseY, bobAmp, bobSpeed }: BobTuning,
  time: number,
  x: number,
  z: number
) =>
  baseY +
  Math.sin(time * bobSpeed) * bobAmp * useWeatherStore.getState().waveAmpMult -
  whirlpoolDip(x, z)

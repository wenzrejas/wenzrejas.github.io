import { useControls } from 'leva'
import {
  LINE_DURATION,
  LINE_LENGTH,
  LINE_WIDTH,
  LINE_Y,
  SPAWN_INTERVAL,
  WAVE_AMPLITUDE,
  WIND_ANGLE,
  WIND_ENABLED,
  WIND_OPACITY,
  WIND_SPEED,
} from '../../World/WindLines/constants'
import type { WindLineControls } from '../types'

export function useWindLinesControls() {
  return useControls(
    'Wind Lines',
    {
      windEnabled: { value: WIND_ENABLED, label: 'enabled' },
      windAngle: { value: WIND_ANGLE, min: 0, max: 360, step: 1, label: 'angle (deg)' },
      windSpeed: { value: WIND_SPEED, min: 0, max: 60, step: 0.5, label: 'speed' },
      lineDuration: { value: LINE_DURATION, min: 0.5, max: 10, step: 0.1, label: 'duration' },
      lineLength: { value: LINE_LENGTH, min: 10, max: 300, step: 1, label: 'length' },
      lineY: { value: LINE_Y, min: 0, max: 150, step: 1, label: 'height' },
      waveAmplitude: { value: WAVE_AMPLITUDE, min: 0, max: 20, step: 0.1, label: 'wave amplitude' },
      lineWidth: { value: LINE_WIDTH, min: 0.1, max: 10, step: 0.1, label: 'ribbon width' },
      spawnInterval: {
        value: SPAWN_INTERVAL,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: 'spawn interval',
      },
      windOpacity: { value: WIND_OPACITY, min: 0, max: 1, step: 0.01, label: 'opacity' },
    },
    { collapsed: true }
  ) as WindLineControls
}

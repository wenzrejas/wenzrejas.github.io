import type { ReactNode } from 'react'
import type { WeatherType } from '@/store/weatherStore'

const SUN_RAY_ANGLES = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)

const CLOUD = (
  <g fill="#f4f8ff">
    <circle cx={11} cy={17} r={5} />
    <circle cx={17} cy={13} r={7} />
    <circle cx={23} cy={17.5} r={4.5} />
    <rect x={6} y={17} width={21.5} height={5} rx={2.5} />
  </g>
)

const ICON_SHAPES: Record<WeatherType, ReactNode> = {
  sunny: (
    <>
      <g stroke="#ffd34d" strokeWidth={2} strokeLinecap="round">
        {SUN_RAY_ANGLES.map((angle) => (
          <line
            key={angle}
            x1={16 + Math.cos(angle) * 11}
            y1={16 + Math.sin(angle) * 11}
            x2={16 + Math.cos(angle) * 14}
            y2={16 + Math.sin(angle) * 14}
          />
        ))}
      </g>
      <circle cx={16} cy={16} r={8} fill="#ffd34d" />
    </>
  ),
  moonlit: <path d="M13.28 6.38 A10 10 0 1 0 25.62 18.72 A9 9 0 0 1 13.28 6.38 Z" fill="#cfe8ff" />,
  cloudy: <g transform="translate(0 2)">{CLOUD}</g>,
  rainy: (
    <>
      <g transform="translate(0 -2)">{CLOUD}</g>
      <g stroke="#8fd3ff" strokeWidth={2} strokeLinecap="round">
        <line x1={11} y1={23} x2={9} y2={28} />
        <line x1={17} y1={23} x2={15} y2={28} />
        <line x1={23} y1={23} x2={21} y2={28} />
      </g>
    </>
  ),
  windy: (
    <g fill="none" stroke="#eaf5ff" strokeWidth={2.2} strokeLinecap="round">
      <path d="M4 12 H19 A3.5 3.5 0 1 0 15.5 8.5" />
      <path d="M4 17 H25 A3.5 3.5 0 1 1 21.5 20.5" />
      <path d="M4 22 H14" />
    </g>
  ),
}

export default function WeatherIcon({ weather }: { weather: WeatherType }) {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true">
      {ICON_SHAPES[weather]}
    </svg>
  )
}

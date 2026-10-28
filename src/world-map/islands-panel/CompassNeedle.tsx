import type { CSSProperties } from 'react'
import type { IslandKey } from '@/world/islands/shared/constants'
import { ISLAND_LIST_ORDER } from './constants'
import './CompassNeedle.scss'

interface CompassNeedleProps {
  pointedIsland: IslandKey
}

export default function CompassNeedle({ pointedIsland }: CompassNeedleProps) {
  const style = {
    '--pointed-index': ISLAND_LIST_ORDER.indexOf(pointedIsland),
    '--island-count': ISLAND_LIST_ORDER.length,
  } as CSSProperties

  return (
    <li className="compass-needle" style={style} aria-hidden="true">
      <svg className="compass-needle__needle" viewBox="0 0 44 30">
        <path className="compass-needle__lit-face" d="M0 0 L44 15 L0 15 Z" />
        <path className="compass-needle__shaded-face" d="M0 15 L44 15 L0 30 Z" />
        <path className="compass-needle__outline" d="M0 0 L44 15 L0 30 Z" />
      </svg>
    </li>
  )
}

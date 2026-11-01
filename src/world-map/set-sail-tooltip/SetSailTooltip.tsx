import type { CSSProperties } from 'react'
import type { SetSailSpot } from '../map-art/mapArtModel'
import SetSailRibbon from '../set-sail-ribbon/SetSailRibbon'
import './SetSailTooltip.scss'

interface SetSailTooltipProps {
  spot: SetSailSpot
  onSetSail: () => void
}

export default function SetSailTooltip({ spot, onSetSail }: SetSailTooltipProps) {
  const style = {
    left: spot.left,
    top: spot.top,
    '--ribbon-shift': `${spot.shift}px`,
  } as CSSProperties

  return (
    <div className={`set-sail-tooltip set-sail-tooltip--${spot.side}`} style={style}>
      <SetSailRibbon onSetSail={onSetSail} />
    </div>
  )
}

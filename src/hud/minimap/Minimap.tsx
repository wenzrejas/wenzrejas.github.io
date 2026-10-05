import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MINIMAP_COPY } from '@/data/hudCopy'
import { useCoastStore } from '@/store/coastStore'
import { useShipStore } from '@/store/shipStore'
import { bearingDegrees } from '../north'
import { chartIslands, chartPercent } from './chart'
import './Minimap.scss'

const _shipPercent = new THREE.Vector2()

export default function Minimap() {
  const shipRef = useRef<HTMLSpanElement>(null)
  const coastlines = useCoastStore((state) => state.coastlines)
  const islands = useMemo(() => chartIslands(coastlines), [coastlines])

  useEffect(() => {
    const ship = shipRef.current
    if (!ship) return

    let frame = 0
    const tick = () => {
      const { x, z, heading } = useShipStore.getState()
      chartPercent(x, z, _shipPercent)
      ship.style.left = `${_shipPercent.x}%`
      ship.style.top = `${_shipPercent.y}%`
      ship.style.rotate = `${bearingDegrees(heading)}deg`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="minimap">
      <div className="minimap__chart">
        <svg className="minimap__islands" viewBox="0 0 100 100">
          {islands.map(({ key, path }) => (
            <path key={key} className="minimap__land" d={path} />
          ))}
        </svg>
        <span className="minimap__ship" ref={shipRef} />
      </div>
      <span className="minimap__tick minimap__tick--east" />
      <span className="minimap__tick minimap__tick--south" />
      <span className="minimap__tick minimap__tick--west" />
      <span className="minimap__needle" />
      <span className="minimap__north">{MINIMAP_COPY.north}</span>
    </div>
  )
}

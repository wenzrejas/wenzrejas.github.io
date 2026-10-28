import { useId, type ReactNode } from 'react'

export type MenuIconName = 'music' | 'spyglass' | 'chart' | 'helm'

const SLASH = 'M4 4 L20 20'

const ICON_SHAPES: Record<MenuIconName, ReactNode> = {
  music: (
    <>
      <path
        d="M9 17.5 V6.6 L20 4.4 V15.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M9 6.6 L20 4.4" fill="none" stroke="currentColor" strokeWidth={3.4} />
      <ellipse cx={6.6} cy={17.6} rx={2.9} ry={2.4} />
      <ellipse cx={17.6} cy={15.7} rx={2.9} ry={2.4} />
    </>
  ),
  spyglass: (
    <g transform="rotate(-35 12 12)">
      <rect x={1.8} y={10.1} width={3.6} height={3.8} rx={0.6} />
      <rect x={6} y={9.2} width={6.2} height={5.6} rx={0.6} />
      <rect x={12.8} y={8} width={7.4} height={8} rx={0.6} />
      <rect x={20.4} y={7.2} width={1.8} height={9.6} rx={0.6} />
    </g>
  ),
  chart: (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 5 Q7.25 3.4 12 5 T21.5 5 V19 Q16.75 20.6 12 19 T2.5 19 Z" strokeWidth={2} />
      <path
        d="M6 16.2 C8.6 16.4 8.4 11.8 11.4 12 S14.2 9.6 15 9.4"
        strokeWidth={1.7}
        strokeDasharray="1.8 1.6"
      />
      <path d="M16.3 7.1 L19.7 10.5 M19.7 7.1 L16.3 10.5" strokeWidth={2.1} />
    </g>
  ),
  helm: (
    <>
      <circle cx={12} cy={12} r={6.4} fill="none" stroke="currentColor" strokeWidth={2} />
      <path
        d="M14.6 12 L21 12 M13.84 13.84 L18.36 18.36 M12 14.6 L12 21 M10.16 13.84 L5.64 18.36 M9.4 12 L3 12 M10.16 10.16 L5.64 5.64 M12 9.4 L12 3 M13.84 10.16 L18.36 5.64"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <path d="M23.8 12 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M20.78 19.28 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M13.5 22.3 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M6.22 19.28 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M3.2 12 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M6.22 4.72 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M13.5 1.7 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z M20.78 4.72 a1.5 1.5 0 1 0 -3 0 a1.5 1.5 0 1 0 3 0 Z" />
      <circle cx={12} cy={12} r={2.6} />
    </>
  ),
}

interface MenuIconProps {
  icon: MenuIconName
  isSlashed?: boolean
}

export default function MenuIcon({ icon, isSlashed = false }: MenuIconProps) {
  const cutId = useId().replace(/[^\w-]/g, '')

  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      {isSlashed && (
        <mask id={cutId}>
          <rect width={24} height={24} fill="#ffffff" />
          <path d={SLASH} stroke="#000000" strokeWidth={4.5} />
        </mask>
      )}
      <g mask={isSlashed ? `url(#${cutId})` : undefined}>{ICON_SHAPES[icon]}</g>
      {isSlashed && <path d={SLASH} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />}
    </svg>
  )
}

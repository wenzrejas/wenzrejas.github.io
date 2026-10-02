import { useId, type ReactNode } from 'react'

export type MenuIconName = 'music' | 'eye' | 'gear'

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
  eye: (
    <>
      <path
        fillRule="evenodd"
        d="M2 12 C5 6.6 8.4 5 12 5 S19 6.6 22 12 C19 17.4 15.6 19 12 19 S5 17.4 2 12 Z M8.4 12 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0 Z"
      />
      <circle cx={12} cy={12} r={1.8} />
    </>
  ),
  gear: (
    <>
      <circle
        cx={12}
        cy={12}
        r={7.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={3.6}
        strokeDasharray="3 2.97"
      />
      <path
        fillRule="evenodd"
        d="M5.4 12 a6.6 6.6 0 1 0 13.2 0 a6.6 6.6 0 1 0 -13.2 0 Z M9 12 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 Z"
      />
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

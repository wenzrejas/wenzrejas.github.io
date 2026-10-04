import type { ReactNode } from 'react'

export type PanelIconName = 'close' | 'external' | 'mail' | 'pen' | 'person' | 'send'

const ICON_SHAPES: Record<PanelIconName, ReactNode> = {
  close: <path d="M7 7 L17 17 M17 7 L7 17" />,
  external: (
    <>
      <path d="M10.5 4.5 H6.5 A2 2 0 0 0 4.5 6.5 V17.5 A2 2 0 0 0 6.5 19.5 H17.5 A2 2 0 0 0 19.5 17.5 V13.5" />
      <path d="M14 4.5 H19.5 V10" />
      <path d="M19.5 4.5 L11.5 12.5" />
    </>
  ),
  mail: (
    <>
      <rect x={3} y={5.5} width={18} height={13} rx={2} />
      <path d="M3.8 7 L12 13 L20.2 7" />
    </>
  ),
  person: (
    <>
      <circle cx={12} cy={8.2} r={3.6} />
      <path d="M5.2 19.6 C5.2 15.7 8.2 13.4 12 13.4 C15.8 13.4 18.8 15.7 18.8 19.6 Z" />
    </>
  ),
  pen: (
    <>
      <path d="M16.2 3.8 A2.1 2.1 0 0 1 19.2 3.8 L20.2 4.8 A2.1 2.1 0 0 1 20.2 7.8 L9.4 18.6 L4 20 L5.4 14.6 Z" />
      <path d="M14.6 5.4 L18.6 9.4 M5.4 14.6 L9.4 18.6" />
    </>
  ),
  send: (
    <g fill="currentColor" stroke="none">
      <path d="M2.6 10.3 L21.4 2.6 L10.3 13.3 Z" />
      <path d="M11.6 14.4 L21.4 2.6 L15 21.4 Z" />
      <path d="M10.3 13.3 L11.6 14.4 L10.7 19.6 Z" />
    </g>
  ),
}

interface PanelIconProps {
  icon: PanelIconName
  className?: string
}

export default function PanelIcon({ icon, className }: PanelIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_SHAPES[icon]}
    </svg>
  )
}

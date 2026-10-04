import type { ReactNode } from 'react'

export type SocialGlyphName = 'email' | 'linkedin' | 'github' | 'resume'

const GITHUB_MARK =
  'M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844'

const LINKEDIN_N =
  'M10.6 10.1h2.8v1.2c.6-.95 1.65-1.4 2.85-1.4 2 0 3.05 1.3 3.05 3.7v4.9h-2.9v-4.45c0-1.15-.45-1.75-1.4-1.75-1 0-1.6.7-1.6 1.85v4.35h-2.8z'

const GLYPH_SHAPES: Record<SocialGlyphName, ReactNode> = {
  email: (
    <>
      <rect
        x={2.5}
        y={4.5}
        width={19}
        height={15}
        rx={2.6}
        className="social-glyph__paper"
        stroke="currentColor"
        strokeWidth={2.2}
      />
      <path
        d="M4.6 7.2 L12 12.8 L19.4 7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.8 17.4 L9.8 12.4 M19.2 17.4 L14.2 12.4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </>
  ),
  linkedin: (
    <>
      <rect x={2.5} y={2.5} width={19} height={19} rx={3.6} fill="currentColor" />
      <circle cx={6.9} cy={7.3} r={1.75} className="social-glyph__paper" />
      <rect x={5.4} y={10.1} width={3} height={8.4} rx={0.4} className="social-glyph__paper" />
      <path d={LINKEDIN_N} className="social-glyph__paper" />
    </>
  ),
  github: (
    <path
      d={GITHUB_MARK}
      transform="translate(1.2 1.2) scale(1.137)"
      fill="currentColor"
      fillRule="evenodd"
    />
  ),
  resume: (
    <>
      <path
        d="M6.2 2.5 H14.6 L19.8 7.7 V20.3 A1.2 1.2 0 0 1 18.6 21.5 H6.2 A1.2 1.2 0 0 1 5 20.3 V3.7 A1.2 1.2 0 0 1 6.2 2.5 Z"
        fill="currentColor"
      />
      <path d="M14.6 2.5 V6.5 A1.2 1.2 0 0 0 15.8 7.7 H19.8 Z" className="social-glyph__paper" />
      <path
        d="M8.3 11.6 H16.5 M8.3 14.6 H16.5 M8.3 17.6 H16.5"
        className="social-glyph__lines"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </>
  ),
}

interface SocialGlyphProps {
  glyph: SocialGlyphName
  className?: string
}

export default function SocialGlyph({ glyph, className }: SocialGlyphProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {GLYPH_SHAPES[glyph]}
    </svg>
  )
}

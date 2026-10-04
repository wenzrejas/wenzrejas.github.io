import type { CSSProperties } from 'react'
import PanelIcon from '../PanelIcon'
import { splashMasks } from '../splash/splashModel'
import SocialGlyph, { type SocialGlyphName } from './SocialGlyph'
import './SocialLinks.scss'

export interface SocialLink {
  label: string
  href: string
  glyph: SocialGlyphName
}

interface SocialLinksProps {
  links: SocialLink[]
}

export default function SocialLinks({ links }: SocialLinksProps) {
  const masks = splashMasks()

  return (
    <ul className="social-links">
      {links.map(({ label, href, glyph }, i) => (
        <li key={label}>
          <a
            className={`social-link social-link--${glyph}`}
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="social-link__badge">
              <span
                className="social-link__splash"
                style={{ '--splash': masks[i % masks.length] } as CSSProperties}
              />
              <SocialGlyph glyph={glyph} className="social-link__glyph" />
            </span>
            <span className="social-link__label">{label}</span>
            <PanelIcon icon="external" className="social-link__arrow" />
          </a>
        </li>
      ))}
    </ul>
  )
}

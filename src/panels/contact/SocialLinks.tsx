import type { CSSProperties } from 'react'
import { CONTACT_COPY } from '@/data/panelCopy'
import { SOCIAL_LINKS } from '@/data/socialLinks'
import PanelIcon from '../shared/PanelIcon'
import { splashMasks } from '../shared/splash/splashModel'
import SocialGlyph, { type SocialGlyphName } from './SocialGlyph'
import './SocialLinks.scss'

interface SocialLink {
  label: string
  href: string
  glyph: SocialGlyphName
}

const LINKS: SocialLink[] = [
  { label: CONTACT_COPY.links.email, href: SOCIAL_LINKS.email, glyph: 'email' },
  { label: CONTACT_COPY.links.linkedin, href: SOCIAL_LINKS.linkedin, glyph: 'linkedin' },
  { label: CONTACT_COPY.links.github, href: SOCIAL_LINKS.github, glyph: 'github' },
  { label: CONTACT_COPY.links.resume, href: SOCIAL_LINKS.resume, glyph: 'resume' },
]

export default function SocialLinks() {
  const masks = splashMasks()

  return (
    <ul className="social-links">
      {LINKS.map(({ label, href, glyph }, i) => (
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

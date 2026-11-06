import type { CSSProperties } from 'react'
import { trackEvent } from '@/analytics/analytics'
import type { SocialPlatform } from '@/data/socialLinks'
import PanelIcon from '../PanelIcon'
import { splashMasks } from '../splash/splashModel'
import SocialGlyph from './SocialGlyph'
import './SocialLinks.scss'

export interface SocialLink {
  label: string
  href: string
  glyph: SocialPlatform
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
            onClick={() => trackEvent('social_link_clicked', { platform: glyph, source: 'panel' })}
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

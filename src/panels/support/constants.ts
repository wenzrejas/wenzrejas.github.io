import { SUPPORT_COPY } from '@/data/panelCopy'
import { SOCIAL_LINKS } from '@/data/socialLinks'
import type { SocialLink } from '../shared/social-links/SocialLinks'

export const SUPPORT_PAINTING_URL = '/images/panels/lumina-point.webp'

export const SUPPORT_LINKS: SocialLink[] = [
  { label: SUPPORT_COPY.links.kofi, href: SOCIAL_LINKS.kofi, glyph: 'kofi' },
]

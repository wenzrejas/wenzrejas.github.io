import { CONTACT_COPY } from '@/data/panelCopy'
import { SOCIAL_LINKS } from '@/data/socialLinks'
import type { SocialLink } from '../shared/social-links/SocialLinks'

export const CONTACT_PAINTING_URL = '/images/panels/lumina-point.webp'

export const CONTACT_LINKS: SocialLink[] = [
  { label: CONTACT_COPY.links.email, href: SOCIAL_LINKS.email, glyph: 'email' },
  { label: CONTACT_COPY.links.linkedin, href: SOCIAL_LINKS.linkedin, glyph: 'linkedin' },
  { label: CONTACT_COPY.links.github, href: SOCIAL_LINKS.github, glyph: 'github' },
  { label: CONTACT_COPY.links.resume, href: SOCIAL_LINKS.resume, glyph: 'resume' },
]

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
export const WEB3FORMS_ACCESS_KEY = '2a75053e-f086-4ca2-8035-d4c9a79935cb'

export const DEV_SEND_SECONDS = 1.2
export const DEV_SEND_SUCCEEDS = true

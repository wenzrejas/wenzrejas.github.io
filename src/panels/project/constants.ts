import type { ProjectKey } from '@/store/panelStore'
import type { ToolKey } from '../shared/tool-grid/constants'

export const PROJECT_SPLASH_URL = '/images/panels/lumina-point.webp'

export const GALLERY_MIN_SLOT_COUNT = 4
export const CAROUSEL_EDGE_SLACK_PIXELS = 1
export const CAROUSEL_DRAG_THRESHOLD_PIXELS = 5

interface ProjectShowcase {
  tools: ToolKey[]
  url?: string
  screenshots: string[]
}

export const PROJECT_SHOWCASES: Record<ProjectKey, ProjectShowcase> = {
  beeSigned: {
    tools: ['vue', 'javascript', 'symfony', 'html', 'css'],
    screenshots: [
      '/images/projects/beesigned/demo.gif',
      '/images/projects/beesigned/formaliti-dashboard.webp',
      '/images/projects/beesigned/formaliti-send.webp',
      '/images/projects/beesigned/formaliti-fields.webp',
    ],
  },
  chooChooChain: {
    tools: ['react', 'typescript', 'threejs', 'tailwind', 'gsap'],
    url: 'https://wenzrejas.github.io/choo-choo-chain/',
    screenshots: [
      '/images/projects/choo-choo-chain/gameplay.webp',
      '/images/projects/choo-choo-chain/title.webp',
      '/images/projects/choo-choo-chain/long-train.webp',
      '/images/projects/choo-choo-chain/game-over.webp',
    ],
  },
  paymentsManager: {
    tools: ['angular', 'typescript', 'tailwind', 'scss', 'chartjs'],
    url: 'https://help.globalpayments.com/products/payments-manager-plus',
    screenshots: [
      '/images/projects/payments-manager/login.webp',
      '/images/projects/payments-manager/manual-invoice.webp',
      '/images/projects/payments-manager/products-services.webp',
      '/images/projects/payments-manager/metrics.webp',
      '/images/projects/payments-manager/redirecting.webp',
    ],
  },
  gelify: {
    tools: ['angular', 'typescript', 'scss', 'gsap', 'storybook'],
    url: 'https://engagis.com/impress-plus-software/',
    screenshots: [
      '/images/projects/gelify/template-builder.webp',
      '/images/projects/gelify/dashboard.webp',
      '/images/projects/gelify/asset-library.webp',
      '/images/projects/gelify/campaign-schedule.webp',
      '/images/projects/gelify/players-table.webp',
      '/images/projects/gelify/upload-files.webp',
    ],
  },
  uiuxWorks: {
    tools: ['figma', 'adobexd', 'illustrator', 'photoshop'],
    screenshots: [],
  },
  qoves: {
    tools: ['react', 'typescript', 'scss', 'gsap', 'recharts'],
    url: 'https://www.qoves.com/',
    screenshots: [
      '/images/projects/qoves/home.webp',
      '/images/projects/qoves/portal-lashes.webp',
      '/images/projects/qoves/portal-visual-changes.webp',
      '/images/projects/qoves/portal-protocol.webp',
      '/images/projects/qoves/portal-action-plan.webp',
      '/images/projects/qoves/home-plan.webp',
      '/images/projects/qoves/home-progress.webp',
      '/images/projects/qoves/man-protocol.webp',
      '/images/projects/qoves/security.webp',
      '/images/projects/qoves/testimonial.webp',
      '/images/projects/qoves/press.webp',
    ],
  },
}

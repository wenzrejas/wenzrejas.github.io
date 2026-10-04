import type { TOOLKIT_COPY } from '@/data/panelCopy'
import type { GroveKey } from '@/store/panelStore'

export type ToolKey = keyof typeof TOOLKIT_COPY.tools

export const TOOLKIT_PAINTING_URL = '/images/panels/lumina-point.webp'
export const TOOL_LOGO_SPRITE_URL = '/images/panels/tech-logos.svg'

export const GROVE_TOOLS: Record<GroveKey, ToolKey[]> = {
  frontend: [
    'angular',
    'react',
    'vue',
    'typescript',
    'javascript',
    'html',
    'css',
    'scss',
    'tailwind',
    'bootstrap',
  ],
  creative: ['gsap', 'recharts', 'chartjs', 'storybook'],
  visuals: ['threejs', 'webgl', 'blender'],
  design: ['figma', 'adobexd', 'illustrator', 'photoshop', 'uiux'],
}

export const WIDE_LOGO_TOOLS = new Set<ToolKey>(['uiux'])

export const TOOL_TINTS: Record<ToolKey, string> = {
  angular: '#dd0031',
  react: '#61dafb',
  vue: '#4fc08d',
  typescript: '#3178c6',
  javascript: '#323330',
  html: '#e34f26',
  css: '#663399',
  scss: '#cc6699',
  tailwind: '#06b6d4',
  bootstrap: '#7952b3',
  gsap: '#0ae448',
  recharts: '#22b5bf',
  chartjs: '#ff6384',
  storybook: '#ff4785',
  threejs: '#4a4a4a',
  webgl: '#990000',
  figma: '#f24e1e',
  adobexd: '#ff61f6',
  illustrator: '#ff9a00',
  photoshop: '#31a8ff',
  blender: '#e87d0d',
  uiux: '#b54544',
}

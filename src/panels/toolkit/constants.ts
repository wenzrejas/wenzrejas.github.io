import type { GroveKey } from '@/store/panelStore'
import type { ToolKey } from '../shared/tool-grid/constants'

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

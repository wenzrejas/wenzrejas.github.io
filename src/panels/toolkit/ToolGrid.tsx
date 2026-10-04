import type { CSSProperties } from 'react'
import { TOOLKIT_COPY } from '@/data/panelCopy'
import { splashMasks } from '../shared/splash/splashModel'
import { TOOL_LOGO_SPRITE_URL, TOOL_TINTS, WIDE_LOGO_TOOLS, type ToolKey } from './constants'
import './ToolGrid.scss'

interface ToolGridProps {
  tools: ToolKey[]
}

export default function ToolGrid({ tools }: ToolGridProps) {
  const masks = splashMasks()

  return (
    <ul className="tool-grid">
      {tools.map((tool, i) => (
        <li
          key={tool}
          className="tool-card"
          style={
            { '--tint': TOOL_TINTS[tool], '--splash': masks[i % masks.length] } as CSSProperties
          }
        >
          <span className="tool-card__badge">
            <span className="tool-card__splash" />
            <svg
              className={
                WIDE_LOGO_TOOLS.has(tool)
                  ? 'tool-card__logo tool-card__logo--wide'
                  : 'tool-card__logo'
              }
              aria-hidden="true"
            >
              <use href={`${TOOL_LOGO_SPRITE_URL}#${tool}`} />
            </svg>
          </span>
          <span className="tool-card__name">{TOOLKIT_COPY.tools[tool]}</span>
          <span className="tool-card__rule" />
        </li>
      ))}
    </ul>
  )
}

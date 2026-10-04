import { useEffect, type ComponentType } from 'react'
import { useTransition } from '@react-spring/web'
import { audio } from '@/audio/audioManager'
import { usePanelStore, type PanelKey } from '@/store/panelStore'
import ContactPanel from './contact/ContactPanel'
import {
  SHEET_CLOSE_SPRING,
  SHEET_SLIDE_PIXELS,
  SHEET_SPRING,
  SHEET_TILT_DEGREES,
} from './constants'
import type { PanelBodyProps } from './shared/island-panel/IslandPanel'
import SupportPanel from './support/SupportPanel'
import ToolkitPanel from './toolkit/ToolkitPanel'

const PANEL_BODIES: Record<PanelKey, ComponentType<PanelBodyProps>> = {
  contact: ContactPanel,
  support: SupportPanel,
  frontend: (props) => <ToolkitPanel grove="frontend" {...props} />,
  creative: (props) => <ToolkitPanel grove="creative" {...props} />,
  visuals: (props) => <ToolkitPanel grove="visuals" {...props} />,
  design: (props) => <ToolkitPanel grove="design" {...props} />,
}

const HIDDEN_SHEET = { opacity: 0, x: SHEET_SLIDE_PIXELS, rotate: SHEET_TILT_DEGREES }
const SHOWN_SHEET = { opacity: 1, x: 0, rotate: 0 }
const CLOSING_SHEET = { ...HIDDEN_SHEET, config: SHEET_CLOSE_SPRING }

export default function Panels() {
  const activePanel = usePanelStore((state) => state.activePanel)
  const transitions = useTransition(activePanel, {
    from: HIDDEN_SHEET,
    enter: SHOWN_SHEET,
    leave: CLOSING_SHEET,
    config: SHEET_SPRING,
  })

  useEffect(
    () =>
      usePanelStore.subscribe((state, previous) => {
        if (state.activePanel !== previous.activePanel) audio.play('paperPanel')
      }),
    []
  )

  return transitions((motion, key) => {
    if (!key) return null
    const Body = PANEL_BODIES[key]
    return <Body motion={motion} />
  })
}

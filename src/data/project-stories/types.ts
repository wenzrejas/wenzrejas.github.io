import type { PanelIconName } from '@/panels/shared/PanelIcon'

interface ProjectFact {
  label: string
  value: string
  icon?: PanelIconName
}

interface StoryHighlight {
  label: string
  text: string
}

export interface StoryChapter {
  heading: string
  title: string
  paragraphs: string[]
  highlights?: {
    title: string
    items: StoryHighlight[]
  }
}

export interface ProjectStory {
  tagline: string
  lead: string
  facts: ProjectFact[]
  chapters: StoryChapter[]
  action?: string
}

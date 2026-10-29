import { PROJECT_PANEL_COPY } from '@/data/panelCopy'
import { PROJECT_STORIES } from '@/data/project-stories/projectStories'
import type { ProjectKey } from '@/store/panelStore'
import Cartouche from '../shared/cartouche/Cartouche'
import PanelIcon from '../shared/PanelIcon'
import ToolGrid from '../shared/tool-grid/ToolGrid'
import { PROJECT_SHOWCASES } from './constants'
import ProjectChapter from './ProjectChapter'
import ProjectGallery from './ProjectGallery'
import './ProjectContent.scss'

interface ProjectContentProps {
  project: ProjectKey
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const story = PROJECT_STORIES[project]
  const showcase = PROJECT_SHOWCASES[project]

  return (
    <>
      <div className="island-panel__beside-splash">
        <p className="island-panel__lead">{story.lead}</p>
        <dl className="project-facts">
          {story.facts.map(({ label, value, icon }) => (
            <div key={label} className="project-facts__fact">
              <dt className="project-facts__label">{label}</dt>
              <dd className="project-facts__value">
                {icon && <PanelIcon icon={icon} className="project-facts__icon" />}
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {PROJECT_PANEL_COPY.previewHeading}
        </h3>
        <ProjectGallery screenshots={showcase.screenshots} />
      </section>
      <section className="island-panel__section">
        <h3 className="island-panel__heading island-panel__heading--ornate">
          {PROJECT_PANEL_COPY.toolsHeading}
        </h3>
        <ToolGrid tools={showcase.tools} />
      </section>
      {story.chapters.map((chapter) => (
        <ProjectChapter key={chapter.heading} chapter={chapter} />
      ))}
      {story.action && showcase.url && (
        <div className="project-visit">
          <a className="project-visit__link" href={showcase.url} target="_blank" rel="noreferrer">
            <Cartouche />
            <span className="project-visit__label">{story.action}</span>
          </a>
        </div>
      )}
    </>
  )
}

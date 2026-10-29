import type { StoryChapter } from '@/data/project-stories/types'
import './ProjectChapter.scss'

interface ProjectChapterProps {
  chapter: StoryChapter
}

export default function ProjectChapter({ chapter }: ProjectChapterProps) {
  return (
    <section className="island-panel__section">
      <h3 className="island-panel__heading">{chapter.heading}</h3>
      <h4 className="project-chapter__title">{chapter.title}</h4>
      {chapter.paragraphs.map((paragraph) => (
        <p key={paragraph} className="project-chapter__paragraph">
          {paragraph}
        </p>
      ))}
      {chapter.highlights && (
        <>
          <p className="project-chapter__highlights-title">{chapter.highlights.title}</p>
          <ul className="project-chapter__highlights">
            {chapter.highlights.items.map(({ label, text }) => (
              <li key={label} className="project-chapter__highlight">
                <strong className="project-chapter__highlight-label">{label}</strong>
                {text}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

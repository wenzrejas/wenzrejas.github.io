import { useState } from 'react'
import OrbiStage from './OrbiStage'
import './OrbiPreview.scss'

const dialoguePages = [
  {
    heading: 'Oh! A visitor!',
    lines: [
      'I wasn’t expecting company!',
      'I’m Orbi, your little wayfinder.',
      'I’ll help you explore these waters.',
    ],
  },
  {
    heading: 'Shall we set sail?',
    lines: [
      'These seas are full of amazing places,',
      'hidden stories, and a few surprises…',
      'Let’s see what’s beyond the horizon.',
    ],
  },
]

export default function OrbiPreview() {
  const [isModelView, setIsModelView] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const dialogue = dialoguePages[pageIndex]

  return (
    <main className="orbi-preview" aria-label="Orbi dialogue preview">
      <header className="orbi-preview__header">
        <nav className="orbi-preview__views" aria-label="Preview mode">
          <button type="button" aria-pressed={!isModelView} onClick={() => setIsModelView(false)}>
            Dialogue
          </button>
          <button type="button" aria-pressed={isModelView} onClick={() => setIsModelView(true)}>
            Model
          </button>
        </nav>
      </header>
      <div className={`orbi-preview__scene${isModelView ? ' orbi-preview__scene--model' : ''}`}>
        <div className="orbi-preview__stage">
          <OrbiStage isInteractive={isModelView} />
          {!isModelView && (
            <svg className="orbi-preview__greeting" viewBox="0 0 90 85" aria-hidden="true">
              <path d="m20 41-6-20m28 13 8-26m8 38 15-12" />
              <circle cx="20" cy="54" r="2" />
              <circle cx="39" cy="48" r="2" />
            </svg>
          )}
        </div>
        {!isModelView && (
          <section className="orbi-dialogue" aria-label="Orbi’s welcome">
            <svg
              className="orbi-dialogue__paper"
              viewBox="0 0 680 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="orbi-dialogue__shadow"
                d="M44 19 645 22Q671 25 670 50L667 325Q666 345 638 344L43 342Q21 342 21 318L23 142 4 125 24 116 25 44Q23 24 44 19Z"
              />
              <path
                className="orbi-dialogue__sheet"
                d="m40 10 198 3 196-4 203 7q23 0 26 26l-3 109 3 106-5 56q-1 22-27 22l-201-3-195 3-193-4q-22-1-23-23l3-107-2-63L1 120l21-11 1-68q-1-23 17-31Z"
              />
              <path
                className="orbi-dialogue__crease"
                d="m40 11-5 19-12 4m621-16-2 16 19 8M20 308l16 3 5 19m590 4 2-16 24-5"
              />
            </svg>
            <span className="orbi-dialogue__name">Orbi</span>
            <div className="orbi-dialogue__copy" aria-live="polite" aria-atomic="true">
              <h2>{dialogue.heading}</h2>
              <p>
                {dialogue.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            </div>
            <nav className="orbi-dialogue__navigation" aria-label="Dialogue pages">
              <button
                type="button"
                aria-label="Previous dialogue page"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex(pageIndex - 1)}
              >
                <span aria-hidden="true">◂</span> Back
              </button>
              <span>
                {pageIndex + 1} / {dialoguePages.length}
              </span>
              <button
                type="button"
                aria-label="Next dialogue page"
                disabled={pageIndex === dialoguePages.length - 1}
                onClick={() => setPageIndex(pageIndex + 1)}
              >
                Next <span aria-hidden="true">▸</span>
              </button>
            </nav>
          </section>
        )}
      </div>
      {isModelView && <p className="orbi-preview__hint">Drag to rotate · Scroll to zoom</p>}
    </main>
  )
}

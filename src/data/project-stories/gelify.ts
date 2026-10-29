import type { ProjectStory } from './types'

export const GELIFY_STORY: ProjectStory = {
  tagline: 'Every screen starts here.',
  lead: "Gelify is Engagis's Angular component framework, the shared set of building blocks behind its products. I built it from the first commit, and with it a template builder that lets teams design animated, responsive slides right in the browser.",
  facts: [
    { label: 'Role', value: 'Lead Developer' },
    { label: 'Timeline', value: '2020 – 2025' },
    { label: 'Built For', value: 'Engagis' },
    { label: 'Packages', value: '6 libraries' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'One toolkit, many products.',
      paragraphs: [
        'Engagis builds several web products, and each one needs the same pieces: forms, tables, calendars, dialogs, and a consistent look. Gelify provides them as installable packages, so every team starts from the same foundation.',
        "It grew out of GEL, the team's earlier component library, which I helped build and maintain. Gelify was the fresh start: a modern Angular foundation, with components documented and previewed in Storybook.",
      ],
      highlights: {
        title: "What's in the box.",
        items: [
          {
            label: 'UI components',
            text: 'More than 50 themeable components, from inputs, selects, and dialogs to cards, tags, and toasts.',
          },
          {
            label: 'Data and scheduling',
            text: 'A data table and a scheduler for the dense, calendar-heavy screens products rely on.',
          },
          {
            label: 'Editors',
            text: 'A rich text editor, image cropper, and color picker ready to drop into any form.',
          },
          {
            label: 'Template builder',
            text: 'A full visual editor for animated slides, packaged like any other component.',
          },
        ],
      },
    },
    {
      heading: 'The Template Builder',
      title: 'Design in motion.',
      paragraphs: [
        'The heart of Gelify is the template builder, a visual editor for creating animated slides right in the browser. Teams stack text, shapes, images, and video into layers, arrange them on a canvas, and bring them to life on a timeline.',
        'I built it from the first prototype to a stable release and beyond, shipping it through dozens of beta versions as it grew from a simple canvas into a full design tool.',
      ],
      highlights: {
        title: 'Everything a slide needs.',
        items: [
          {
            label: 'Layers and canvas',
            text: 'Text, shapes, images, and video with dragging, resizing, multi-select, alignment, zoom, and drag-and-drop reordering.',
          },
          {
            label: 'Timeline animation',
            text: 'Keyframed animations with easing, durations, and start times, previewed on a timeline.',
          },
          {
            label: 'Responsive by design',
            text: 'Every layer keeps its own position, styling, and animation for desktop, tablet, and mobile.',
          },
          {
            label: 'Typography and color',
            text: 'Google Fonts, custom fonts, text styling, brand color presets, and video backgrounds.',
          },
        ],
      },
    },
    {
      heading: 'The Result',
      title: 'Powering real products.',
      paragraphs: [
        "Gelify runs throughout Engagis's products. In Impress Plus, the company's enterprise digital signage platform, the template builder powers the drag-and-drop editor where teams build and animate content for their screens without writing code.",
        'Each improvement shipped as a versioned package that the products could pick up.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'Built to be reused.',
      paragraphs: [
        'I set Gelify up as a single Angular workspace that builds six libraries, with schematics for setup, SCSS theming, and a Storybook of live examples. The template builder uses GSAP to drive its animations.',
        'Because other teams build on it, components are configurable through inputs, themeable through SCSS, and documented with live examples.',
      ],
    },
    {
      heading: 'Your Next Stop',
      title: 'See it at work.',
      paragraphs: [
        'Gelify is internal, but its work is on show in Impress Plus, the platform it helps bring to life.',
      ],
    },
  ],
  action: 'See Impress Plus',
}

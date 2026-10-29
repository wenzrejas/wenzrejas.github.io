import type { ProjectStory } from './types'

export const UIUX_WORKS_STORY: ProjectStory = {
  tagline: 'Designed to be built.',
  lead: "A showcase of the interfaces I've designed, from early wireframes to polished, production-ready screens. Because I also build what I design, every layout is shaped around how it will look, feel, and work in the real product.",
  facts: [
    { label: 'Role', value: 'UI/UX Designer' },
    { label: 'Focus', value: 'Product & Web UI' },
    { label: 'Main Tool', value: 'Figma' },
    { label: 'Approach', value: 'Design to Code' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'Design that ships.',
      paragraphs: [
        "UI/UX Works collects the screens I've designed across products and personal projects. Each one was drawn with the finished product in mind: real data, real states, and real constraints.",
        'My challenge in every design is the same: make complex tasks feel simple without losing the details people depend on.',
      ],
    },
    {
      heading: 'The Process',
      title: 'From sketch to screen.',
      paragraphs: [
        'Every design starts rough and gets sharper with each pass, so the big questions are settled before the pixels are polished.',
      ],
      highlights: {
        title: 'How a design comes together.',
        items: [
          {
            label: 'Flows',
            text: 'Mapping who uses the product and the paths they take through it.',
          },
          {
            label: 'Wireframes',
            text: 'Low-fidelity layouts that settle structure and hierarchy first.',
          },
          {
            label: 'Visual design',
            text: 'Type, color, and components that give the product its personality.',
          },
          {
            label: 'Prototypes and handoff',
            text: 'Clickable prototypes and developer-ready specs, often built by me.',
          },
        ],
      },
    },
    {
      heading: 'The Result',
      title: 'Designs that made it to the real world.',
      paragraphs: [
        'I redesigned the invoice workflows in Payments Manager+, cutting friction for merchants and improving task efficiency by 30%. At Engagis, I shaped reusable components behind a shared design system, so teams could design and build from the same parts.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'Designing for the medium.',
      paragraphs: [
        'I work mostly in Figma, with Adobe XD, Illustrator, and Photoshop for visuals and assets. Since I build the front end too, I design with components, breakpoints, and motion in mind from the first frame.',
      ],
    },
    {
      heading: 'Your Next Stop',
      title: 'Take a closer look.',
      paragraphs: ['Browse the gallery above to see selected screens up close.'],
    },
  ],
}

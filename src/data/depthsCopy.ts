export interface MilestoneCopy {
  chapter: string
  dates: string
  title: string
  place: string
  summary: string
  highlights: string[]
  skills: string[]
}

export const DEPTHS_COPY = {
  surface: 'Return to Surface',
  dialNumerals: ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
  highlightsLabel: 'Highlights',
  skillsLabel: 'Stack',
  milestones: [
    {
      chapter: '01',
      dates: 'Jun 2026 – Sep 2026',
      title: 'Frontend Developer',
      place: 'QOVES · Project-based, Remote',
      summary:
        'Worked on the development and delivery of a production web application, collaborating closely with designers and developers from implementation through release.',
      highlights: [
        'Built and shipped frontend features using React and TypeScript within a 4-month project timeline.',
        'Developed interactive dashboards and data visualizations using Recharts, turning complex datasets into clear and accessible interfaces',
        'Implemented polished UI interactions and animations using GSAP while translating Figma/UI designs into responsive production interfaces.',
      ],
      skills: ['React', 'TypeScript', 'Recharts', 'GSAP'],
    },
    {
      chapter: '02',
      dates: 'Jul 2022 – Apr 2026',
      title: 'Mid-Level Frontend Developer',
      place: 'CashJar · Freelance, Remote',
      summary:
        'Worked on an invoicing and service-management platform focused on streamlining invoice creation, tracking, and payment workflows.',
      highlights: [
        'Led frontend development using Angular for service management, real-time invoice tracking, and payment collection features.',
        ' Reduced application load times by 35% and improved rendering performance by 25% through lazy loading, OnPush change detection, and optimized state management.',
        'Redesigned invoice workflows to reduce user friction and improve task efficiency by 30%.',
      ],
      skills: ['Angular', 'TypeScript', 'SCSS', 'Figma', 'Framer'],
    },
    {
      chapter: '03',
      dates: 'Sep 2020 – Mar 2025',
      title: 'Mid-Level Frontend Developer',
      place: 'Engagis Inc. · Cagayan de Oro City, PH',
      summary:
        'Developed and maintained scalable frontend applications and reusable component systems for enterprise-facing products.',
      highlights: [
        'Built reusable UI components using Angular, TypeScript, and Storybook, supporting a centralized design system and consistent interfaces.',
        'Architected and maintained a modular Angular application structure that supported scalable feature development and consistent coding standards.',
        'Developed a configurable theming system that enabled dynamic styling based on user preferences and organization-specific requirements.',
      ],
      skills: ['Angular', 'TypeScript', 'RxJS', 'Storybook', 'GSAP'],
    },
    {
      chapter: '04',
      dates: 'Apr 2018 – Sep 2020',
      title: 'Full-stack Developer',
      place: 'Fligno Software Philippines · Cagayan de Oro City, PH',
      summary:
        'Worked across frontend and backend development for web applications, including a collaborative document-signing platform.',
      highlights: [
        'Developed full-stack features using Vue.js and Symfony, covering workflows from document upload through secure signing and storage.',
        'Implemented real-time document-signing workflows supporting synchronous and asynchronous collaboration across users and devices.',
        'Built responsive Vue.js interfaces and integrated frontend functionality with Symfony backend services.',
      ],
      skills: ['Vue.js', 'Symfony', 'PHP', 'MySQL', 'React'],
    },
    {
      chapter: '05',
      dates: 'Jul 2017 – Apr 2018',
      title: 'WordPress Developer',
      place: 'LogicBase Interactive LLC · Cagayan de Oro City, PH',
      summary:
        'Designed, developed, and maintained responsive WordPress websites for client projects.',
      highlights: [
        'Built mobile-friendly websites optimized for usability, performance, and cross-device compatibility.',
        'Implemented website security and performance improvements to improve reliability and overall user experience.',
        'Worked on responsive frontend implementation across desktop, tablet, and mobile devices.',
      ],
      skills: ['WordPress', 'jQuery', 'PHP', 'JavaScript', 'Bootstrap'],
    },
  ] satisfies MilestoneCopy[],
}

import type { ProjectStory } from './types'

export const QOVES_STORY: ProjectStory = {
  tagline: 'Beauty, backed by data.',
  lead: 'A facial aesthetics platform that turns photos into a science-based analysis and a personalized, non-surgical plan. I joined the frontend team to build the member portal where those results come to life, and to grow the website that brings people through the door.',
  facts: [
    { label: 'Role', value: 'Frontend Developer' },
    { label: 'Timeline', value: 'Jun – Sep 2026' },
    { label: 'Team', value: 'Frontend Team' },
    { label: 'Platform', value: 'Web Portal & Site' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'Your face, read like data.',
      paragraphs: [
        'QOVES offers an objective, evidence-based look at facial aesthetics. Members upload photos, and the analysis measures their features across more than 160 assessments, from symmetry and proportions to skin and hair, before pairing the results with a personalized plan.',
        'My challenge was presenting dense biometric data so it feels clear, calm, and personal rather than clinical.',
      ],
    },
    {
      heading: 'The Member Portal',
      title: 'Turning measurements into meaning.',
      paragraphs: [
        'Most of my work went into the rebuilt member portal, where people explore their results. I built the Dimorphism, Proportions, Adiposity, and Neoteny assessments, refined Symmetry, Averageness, and First Impression, and added the feature analyses for eyes, lips, nose, skin, and hair.',
        "I also shaped the first steps of the journey, from the Getting Started introduction to the Protocol overview that lays out each member's plan.",
      ],
      highlights: {
        title: 'Charts that tell a story.',
        items: [
          {
            label: 'Distribution curves',
            text: 'A reusable bell-curve chart that shows where each score sits against the wider population.',
          },
          {
            label: 'Heatmaps and gauges',
            text: 'Heatmaps, gauges, and meters that make a single number easy to read at a glance.',
          },
          {
            label: 'Plan estimations',
            text: 'Doughnut charts that break down the estimations behind each personalized protocol.',
          },
          {
            label: 'Navigation and polish',
            text: 'A floating menu, a mobile top bar, scroll animations, skeleton loading, and a responsive pass across every page.',
          },
        ],
      },
    },
    {
      heading: 'The Website',
      title: 'Pages that earn the click.',
      paragraphs: [
        'On the marketing site, I added entry and scroll animations to the new homepage and smoothed out hero zoom and marquee jitter in in-app browsers.',
        "I built new pages from design, including the Protocol page and its men's edition, Press, Security, and a customer testimonial story told through video, before-and-after results, and week-by-week notes.",
      ],
    },
    {
      heading: 'Measuring What Matters',
      title: 'Tracking that respects consent.',
      paragraphs: [
        'Growth depends on knowing what works, so I rebuilt how the site measures it: a single event dispatcher that feeds both browser pixels and server-side conversion events, campaign and ad-click attribution that persists through the session, and an affiliate partner integration.',
        'All of it sits behind Google Consent Mode, so in regions that require consent, nothing is tracked until the visitor says yes.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'One codebase, many hands.',
      paragraphs: [
        'QOVES runs as a monorepo of Next.js apps that share component, hook, and utility packages, styled with SCSS modules and animated with GSAP.',
        "Working as part of the frontend team meant building for reuse. I split carousels, chips, segment controls, and chart pieces into shared building blocks, and kept each component's logic, animation, data, and props in their own files.",
      ],
    },
    {
      heading: 'Your Next Stop',
      title: 'See the science for yourself.',
      paragraphs: [
        'Explore the live site and follow the journey from photos to a personalized plan.',
      ],
    },
  ],
  action: 'Visit QOVES',
}

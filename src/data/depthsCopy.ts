export interface MilestoneCopy {
  chapter: string
  dates: string
  title: string
  place: string
  summary: string
  highlights: string[]
  skills: string[]
}

const MILESTONE_TEMPLATE = {
  place: 'Company or school',
  summary:
    'Two or three sentences about this chapter: what you worked on, who you worked with, and what changed because of your work.',
  highlights: [
    'A project or feature you shipped',
    'A result you are proud of, ideally with a number',
    'Something you led, taught or learned along the way',
  ],
  skills: ['Language', 'Framework', 'Library', 'Tool', 'Platform'],
}

export const DEPTHS_COPY = {
  surface: 'Return to Surface',
  dialNumerals: ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'],
  highlightsLabel: 'Highlights',
  skillsLabel: 'Stack',
  milestones: [
    { chapter: '01', dates: '2026 – Present', title: 'Frontend Developer', ...MILESTONE_TEMPLATE },
    { chapter: '02', dates: '2023 – 2025', title: 'Web Developer', ...MILESTONE_TEMPLATE },
    { chapter: '03', dates: '2021 – 2023', title: 'Junior Developer', ...MILESTONE_TEMPLATE },
    {
      chapter: '04',
      dates: '2019 – 2021',
      title: 'Freelance / Early Projects',
      ...MILESTONE_TEMPLATE,
    },
    { chapter: '05', dates: '2017 – 2019', title: 'College / Foundations', ...MILESTONE_TEMPLATE },
  ] satisfies MilestoneCopy[],
}

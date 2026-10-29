import type { ProjectStory } from './types'

export const CHOO_CHOO_CHAIN_STORY: ProjectStory = {
  tagline: 'All aboard. No brakes.',
  lead: 'A browser-based 3D arcade game that puts classic snake on rails. I built it solo for Challenge #23 of Three.js Journey, from the first idea to the final run.',
  facts: [
    { label: 'Role', value: 'Solo Developer' },
    { label: 'Year', value: '2026' },
    { label: 'Made For', value: 'Three.js Journey' },
    { label: 'Rating', value: '4.03 / 5', icon: 'star' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'A classic, with a locomotive twist.',
      paragraphs: [
        'Challenge #23 came with a one-word prompt: Train. I took the grow-and-survive loop of snake and put it on rails, so every wagon the train collects makes it longer and every turn a little riskier.',
        'Each run lasts 80 seconds, and the goal is simple: build the longest, most valuable chain before the clock runs out.',
      ],
    },
    {
      heading: 'The Game',
      title: 'Easy to learn. Hard to keep on track.',
      paragraphs: [
        "The locomotive drives itself. Players steer with the mouse or a finger and hold to boost, which burns energy, while trees, rocks, and the train's own tail stand in the way.",
      ],
      highlights: {
        title: 'Collect. Boost. Survive.',
        items: [
          {
            label: 'Collect wagons',
            text: 'Copper, silver, and gold wagons are worth 10, 50, and 100 points, and each one grows the train.',
          },
          {
            label: 'Boost',
            text: 'Holding the mouse button, or two fingers on mobile, speeds the train up for as long as its energy lasts.',
          },
          {
            label: 'Power-ups',
            text: 'Energy refills, ten extra seconds on the clock, and a six-second shield.',
          },
          {
            label: 'Avoid obstacles',
            text: "Trees, rocks, and the train's own tail, which gets harder to dodge as it grows.",
          },
        ],
      },
    },
    {
      heading: 'Creative Direction',
      title: 'Small world. Big personality.',
      paragraphs: [
        "I went for a bright, low-poly arcade look built from Kenney's train and survival kits, keeping the locomotive at the center so the growing chain becomes the picture.",
      ],
    },
    {
      heading: 'The Result',
      title: 'A little train that made its mark.',
      paragraphs: [
        'The Three.js Journey community rated Choo Choo Chain 4.03 out of 5 in Challenge #23.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'Bringing the tracks to the browser.',
      paragraphs: [
        'I built it with React Three Fiber, using Rapier for physics and Zustand for game state. The world never ends: a zone grid spawns and clears scenery around the train as it moves.',
        "Wagons, obstacles, and ground tiles render as instanced meshes to keep draw calls low, and the tail updates outside React's render cycle so it never flickers. It also installs as an offline-ready app with full touch controls.",
      ],
    },
    {
      heading: 'Your Next Stop',
      title: 'Think you can keep it on track?',
      paragraphs: ['Play it in your browser, on desktop or mobile.'],
    },
  ],
  action: 'Play Choo Choo Chain',
}

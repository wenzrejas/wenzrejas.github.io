import type { ProjectStory } from './types'

export const BEE_SIGNED_STORY: ProjectStory = {
  tagline: 'Signed, sealed, delivered.',
  lead: 'An Australian e-signature app that let businesses send, sign, and track documents online. I worked across the full stack, from the signing screens and document editor to its rebrand from Formaliti to BeeSigned.',
  facts: [
    { label: 'Role', value: 'Full Stack Dev' },
    { label: 'Formerly', value: 'Formaliti' },
    { label: 'Market', value: 'Australia' },
    { label: 'Retired', value: 'March 2024' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'Paperwork, minus the paper.',
      paragraphs: [
        'BeeSigned began life as Formaliti, a service that turned business forms into documents people could sign on a computer or touch screen. As BeeSigned, it became a simple way for Australian businesses to send documents, collect signatures, and keep a record of every step.',
        'My challenge was making a legal process feel effortless: signers needed to finish in a few taps, while senders needed to know exactly where every document stood.',
      ],
    },
    {
      heading: 'The App',
      title: 'From upload to signature.',
      paragraphs: [
        "I worked on every step of a document's journey, building both the screens people used and the services behind them.",
      ],
      highlights: {
        title: 'Every step of the signature.',
        items: [
          {
            label: 'Document editor',
            text: 'Uploading files and placing signature, text, date, and checkbox fields, with reusable templates for documents sent again and again.',
          },
          {
            label: 'Signing experience',
            text: 'A signing flow for desktop and touch screens, protected by an optional six-digit access code.',
          },
          {
            label: 'Sending and tracking',
            text: 'Signing order, automatic reminders before deadlines, and a clear status for every document.',
          },
          {
            label: 'Audit trail',
            text: 'A record of each step in the signing process, kept with the finished document.',
          },
        ],
      },
    },
    {
      heading: 'The Rebrand',
      title: 'A new name and a new look.',
      paragraphs: [
        'When Formaliti became BeeSigned, I carried the product across to the new name and look, updating the app and its website to match.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'Signatures that hold up.',
      paragraphs: [
        "I built the interface in Vue and the services behind it in Symfony. The app was engineered around Australia's Electronic Transactions Act 1999, with an audit trail behind every signature.",
      ],
    },
    {
      heading: 'Looking Back',
      title: 'Retired, not forgotten.',
      paragraphs: [
        'BeeSigned was retired on March 25, 2024, after years of helping Australian businesses go paperless.',
      ],
    },
  ],
}

import type { ProjectStory } from './types'

export const PAYMENTS_MANAGER_STORY: ProjectStory = {
  tagline: 'All your payments, one place.',
  lead: 'A billing and payments app that lets businesses manage customers, products, estimates, invoices, and payment links from one place. I helped shape it across two generations: growing the original app, then laying the foundation for its complete rebuild.',
  facts: [
    { label: 'Role', value: 'Frontend Developer' },
    { label: 'Timeline', value: '2022 – 2026' },
    { label: 'Team', value: 'Frontend Team' },
    { label: 'Offered By', value: 'Global Payments' },
  ],
  chapters: [
    {
      heading: 'The Project',
      title: 'Billing, without the busywork.',
      paragraphs: [
        'Payments Manager+ gives businesses a single home for getting paid. Merchants keep their customers and catalog together, send estimates that become invoices, share payment links, run recurring billing, and take payments on the spot with Virtual Sell.',
        'My challenge was leaving no room for confusion: amounts, statuses, and next steps had to be obvious on every screen, whether a merchant was sending their first invoice or their thousandth.',
      ],
    },
    {
      heading: 'Version Two',
      title: 'Growing what merchants rely on.',
      paragraphs: [
        'I joined while the original app was in full swing and spent most of my time on its billing core. I revamped the invoice and estimate summaries, brought the screens onto a shared UI library, and added a customer-facing receipt view.',
      ],
      highlights: {
        title: 'Where the work landed.',
        items: [
          {
            label: 'Invoices and estimates',
            text: 'Summaries, templates, custom fields, tax exemptions, partial payments, and Level 2 and Level 3 data.',
          },
          {
            label: 'Recurring billing',
            text: 'Payment forms with subscriptions, plus searching, editing, and managing recurring payments.',
          },
          {
            label: 'Customers',
            text: 'Imports, notes, saved cards and bank accounts, and smoother customer payment flows.',
          },
          {
            label: 'Regional support',
            text: 'Canadian currency, postal code validation, and regional date formats.',
          },
        ],
      },
    },
    {
      heading: 'Version Three',
      title: 'Starting from a blank page.',
      paragraphs: [
        "When it was time for a new generation, I set up the new app and rebuilt the experience module by module: customers, products and services, payment links, Virtual Sell, reports, payment forms, and invoice settings. I built each screen's interface first, then connected it to the live services.",
        'I also added a metrics dashboard, transaction reports with Level 2 and Level 3 data, and a banner that keeps support sessions clearly marked.',
      ],
      highlights: {
        title: 'Rebuilt from the ground up.',
        items: [
          {
            label: 'Customer profiles',
            text: 'One view for invoices, estimates, recurring plans, saved cards, bank accounts, notes, contacts, and payment links.',
          },
          {
            label: 'Products and services',
            text: 'Items, categories, bundles, discounts, modifiers, upcharges, brands, and units, each with its own list and form.',
          },
          {
            label: 'Payment forms',
            text: 'Security, confirmations, notifications, entry reports, automations, and recurring and pending payments.',
          },
          {
            label: 'Invoice design',
            text: 'Invoice settings, notification schedules, and seven ready-made invoice templates.',
          },
        ],
      },
    },
    {
      heading: 'The Result',
      title: 'Live for merchants.',
      paragraphs: [
        'Payments Manager+ is offered to Global Payments merchants, who open it straight from their My Account app tray.',
      ],
    },
    {
      heading: 'Behind the Build',
      title: 'Two generations of Angular.',
      paragraphs: [
        'Version two runs on Angular with Bootstrap, data grids, calendars, and Form.io-powered forms. For version three, I moved to a modern Angular with Tailwind CSS, the VEGA design system, Chart.js dashboards, and lightweight motion.',
        'Working on both meant carrying the billing rules merchants depend on, from taxes and partial payments to Level 2 and Level 3 data, into a cleaner, more consistent experience.',
      ],
    },
    {
      heading: 'Your Next Stop',
      title: 'See how it works.',
      paragraphs: [
        'Explore the Global Payments guides to see how customers, invoices, payment links, and Virtual Sell come together.',
      ],
    },
  ],
  action: 'Explore Payments Manager+',
}

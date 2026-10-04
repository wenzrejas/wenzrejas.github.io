import { CONTACT_COPY } from '@/data/panelCopy'

export interface ContactDraft {
  name: string
  email: string
  message: string
}

export type ContactField = keyof ContactDraft

export type ContactErrors = Partial<Record<ContactField, string>>

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function readDraft(formData: FormData): ContactDraft {
  const text = (field: ContactField) => String(formData.get(field) ?? '').trim()
  return { name: text('name'), email: text('email'), message: text('message') }
}

export function validateContact({ name, email, message }: ContactDraft): ContactErrors {
  const errors: ContactErrors = {}
  if (!name) errors.name = CONTACT_COPY.errors.nameMissing
  if (!email) errors.email = CONTACT_COPY.errors.emailMissing
  else if (!EMAIL_SHAPE.test(email)) errors.email = CONTACT_COPY.errors.emailInvalid
  if (!message) errors.message = CONTACT_COPY.errors.messageMissing
  return errors
}

export const hasErrors = (errors: ContactErrors) => Object.values(errors).some(Boolean)

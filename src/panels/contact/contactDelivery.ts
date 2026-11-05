import { waitSeconds } from '@/utils/time'
import {
  DEV_SEND_SECONDS,
  DEV_SEND_SUCCEEDS,
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
} from './constants'

interface Web3FormsReply {
  success: boolean
}

async function simulateDelivery(formData: FormData): Promise<boolean> {
  console.info('Dev mode: this message was not sent.', Object.fromEntries(formData))
  await waitSeconds(DEV_SEND_SECONDS)
  return DEV_SEND_SUCCEEDS
}

export async function deliverContact(formData: FormData): Promise<boolean> {
  if (import.meta.env.DEV) return simulateDelivery(formData)
  formData.append('access_key', WEB3FORMS_ACCESS_KEY)
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData })
    const reply = (await response.json()) as Web3FormsReply
    return response.ok && reply.success
  } catch {
    return false
  }
}

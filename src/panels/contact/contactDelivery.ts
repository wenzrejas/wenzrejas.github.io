import { trackEvent } from '@/analytics/analytics'
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

async function sendToWeb3Forms(formData: FormData): Promise<boolean> {
  formData.append('access_key', WEB3FORMS_ACCESS_KEY)
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData })
    const reply = (await response.json()) as Web3FormsReply
    return response.ok && reply.success
  } catch {
    return false
  }
}

export async function deliverContact(formData: FormData): Promise<boolean> {
  const isDelivered = import.meta.env.DEV
    ? await simulateDelivery(formData)
    : await sendToWeb3Forms(formData)
  trackEvent(isDelivered ? 'contact_form_submitted' : 'contact_form_failed')
  return isDelivered
}

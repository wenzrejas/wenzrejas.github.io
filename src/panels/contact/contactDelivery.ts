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
  await new Promise((resolve) => setTimeout(resolve, DEV_SEND_SECONDS * 1000))
  return DEV_SEND_SUCCEEDS
}

export async function deliverContact(formData: FormData): Promise<boolean> {
  if (import.meta.env.DEV) return simulateDelivery(formData)
  formData.append('access_key', WEB3FORMS_ACCESS_KEY)
  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, { method: 'POST', body: formData })
    const reply: Web3FormsReply = await response.json()
    return response.ok && reply.success
  } catch {
    return false
  }
}

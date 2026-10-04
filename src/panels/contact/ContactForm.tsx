import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { CONTACT_COPY } from '@/data/panelCopy'
import { closePanel } from '@/store/panelStore'
import { startSkyBeam } from '@/store/skyBeamStore'
import { scrollAncestorToEnd } from '@/utils/scroll'
import Cartouche from '../shared/cartouche/Cartouche'
import PanelIcon from '../shared/PanelIcon'
import { deliverContact } from './contactDelivery'
import {
  hasErrors,
  readDraft,
  validateContact,
  type ContactErrors,
  type ContactField,
} from './contactDraft'
import ContactInput from './ContactInput'
import './ContactForm.scss'

export default function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({})
  const [isSending, setSending] = useState(false)
  const [hasSendFailed, setSendFailed] = useState(false)
  const sendErrorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (hasSendFailed && sendErrorRef.current) scrollAncestorToEnd(sendErrorRef.current)
  }, [hasSendFailed])

  const clearError = useCallback((field: ContactField) => {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }, [])

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSending) return
    const formData = new FormData(event.currentTarget)
    const found = validateContact(readDraft(formData))
    setErrors(found)
    if (hasErrors(found)) return

    setSending(true)
    setSendFailed(false)
    const isDelivered = await deliverContact(formData)
    setSending(false)
    if (!isDelivered) {
      setSendFailed(true)
      return
    }
    closePanel()
    startSkyBeam()
  }

  return (
    <form className="contact-form" noValidate onSubmit={send}>
      <ContactInput
        field="name"
        icon="person"
        autoComplete="name"
        error={errors.name}
        onEdit={clearError}
      />
      <ContactInput
        field="email"
        icon="mail"
        type="email"
        autoComplete="email"
        error={errors.email}
        onEdit={clearError}
      />
      <ContactInput
        field="message"
        icon="pen"
        error={errors.message}
        onEdit={clearError}
        isMultiline
      />
      <div className="contact-form__actions">
        <button
          type="submit"
          className="contact-form__send"
          disabled={isSending}
          aria-busy={isSending}
        >
          <Cartouche />
          <span className="contact-form__send-label">
            <PanelIcon icon="send" />
            {isSending ? CONTACT_COPY.sending : CONTACT_COPY.send}
          </span>
        </button>
      </div>
      {hasSendFailed && (
        <p ref={sendErrorRef} className="contact-form__send-error" role="alert">
          {CONTACT_COPY.sendFailed}
        </p>
      )}
    </form>
  )
}

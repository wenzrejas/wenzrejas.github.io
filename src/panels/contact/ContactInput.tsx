import { memo, useId } from 'react'
import { CONTACT_COPY } from '@/data/panelCopy'
import PanelIcon, { type PanelIconName } from '../shared/PanelIcon'
import type { ContactField } from './contactDraft'

interface ContactInputProps {
  field: ContactField
  icon: PanelIconName
  error?: string
  type?: string
  autoComplete?: string
  isMultiline?: boolean
  onEdit: (field: ContactField) => void
}

function ContactInput({
  field,
  icon,
  error,
  type = 'text',
  autoComplete,
  isMultiline = false,
  onEdit,
}: ContactInputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const { label, placeholder } = CONTACT_COPY.fields[field]
  const shared = {
    id,
    name: field,
    placeholder,
    onChange: () => onEdit(field),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  }

  return (
    <div
      className={
        isMultiline ? 'contact-form__field contact-form__field--wide' : 'contact-form__field'
      }
    >
      <label className="contact-form__label" htmlFor={id}>
        {label}
      </label>
      <div
        className={
          error ? 'contact-form__frame contact-form__frame--invalid' : 'contact-form__frame'
        }
      >
        <PanelIcon icon={icon} className="contact-form__icon" />
        {isMultiline ? (
          <textarea
            className="contact-form__input contact-form__input--message"
            rows={4}
            {...shared}
          />
        ) : (
          <input
            className="contact-form__input"
            type={type}
            autoComplete={autoComplete}
            {...shared}
          />
        )}
      </div>
      {error && (
        <span id={errorId} className="contact-form__error">
          {error}
        </span>
      )}
    </div>
  )
}

export default memo(ContactInput)

import { useEffect, type RefObject } from 'react'
import { KEYBOARD_TARGETS } from '@/interaction/constants'
import { DIALOG_CLOSE_BUTTON } from './constants'

interface DialogFocusOptions {
  isOpen?: boolean
  isFocusMovedIn?: boolean
}

const openDialogs: HTMLElement[] = []

const isTabbable = (element: HTMLElement) =>
  element.tabIndex >= 0 &&
  !element.matches(':disabled') &&
  !element.closest('[inert]') &&
  element.getClientRects().length > 0

const tabbablesIn = (dialog: HTMLElement) =>
  [...dialog.querySelectorAll<HTMLElement>(KEYBOARD_TARGETS)].filter(isTabbable)

function keepTabInside(dialog: HTMLElement, event: KeyboardEvent) {
  if (event.key !== 'Tab' || openDialogs[openDialogs.length - 1] !== dialog) return
  const focused = document.activeElement
  if (focused && !dialog.contains(focused) && focused.closest('[role="dialog"]')) return
  const targets = tabbablesIn(dialog)
  if (targets.length === 0) return
  const index = focused instanceof HTMLElement ? targets.indexOf(focused) : -1
  const isAtEdge = event.shiftKey ? index <= 0 : index === -1 || index === targets.length - 1
  if (!isAtEdge) return
  event.preventDefault()
  targets[event.shiftKey ? targets.length - 1 : 0].focus()
}

function keyboardOpenerOutside(dialog: HTMLElement) {
  const focused = document.activeElement
  if (!(focused instanceof HTMLElement) || dialog.contains(focused)) return null
  return focused.matches(':focus-visible') ? focused : null
}

export function useDialogFocus(
  dialogRef: RefObject<HTMLElement | null>,
  { isOpen = true, isFocusMovedIn = true }: DialogFocusOptions = {}
) {
  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog) return
    const opener = keyboardOpenerOutside(dialog)
    openDialogs.push(dialog)
    if (isFocusMovedIn) {
      dialog.querySelector<HTMLElement>(DIALOG_CLOSE_BUTTON)?.focus({ preventScroll: true })
    }
    const trapTab = (event: KeyboardEvent) => keepTabInside(dialog, event)
    document.addEventListener('keydown', trapTab)

    return () => {
      document.removeEventListener('keydown', trapTab)
      openDialogs.splice(openDialogs.indexOf(dialog), 1)
      const focused = document.activeElement
      const isFocusLeftBehind = !focused || focused === document.body || dialog.contains(focused)
      if (opener?.isConnected && isFocusLeftBehind) opener.focus({ preventScroll: true })
    }
  }, [dialogRef, isOpen, isFocusMovedIn])
}

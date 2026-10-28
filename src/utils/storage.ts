export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function forgetStored(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    return
  }
}

export function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}

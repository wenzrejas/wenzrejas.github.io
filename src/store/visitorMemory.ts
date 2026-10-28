import { IS_DEBUG } from '@/app/experience/constants'
import { forgetStored, readStored, writeStored } from '@/utils/storage'

const MEMORY_KEYS = {
  returningVisitor: 'returning-visitor',
  revealedIslands: 'revealed-islands',
  heardRemarks: 'heard-remarks',
  heardDialogues: 'heard-dialogues',
  settings: 'settings',
}

type Memory = keyof typeof MEMORY_KEYS

const PROGRESS_MEMORIES: Memory[] = [
  'returningVisitor',
  'revealedIslands',
  'heardRemarks',
  'heardDialogues',
]

const storedItems = (memory: Memory) => (readStored(MEMORY_KEYS[memory]) ?? '').split(',')

export const isRemembered = (memory: Memory) =>
  !IS_DEBUG && readStored(MEMORY_KEYS[memory]) !== null

export function rememberFlag(memory: Memory) {
  if (!IS_DEBUG) writeStored(MEMORY_KEYS[memory], '1')
}

export function rememberedItems<Item extends string>(memory: Memory, items: readonly Item[]) {
  if (IS_DEBUG) return []
  const stored = storedItems(memory)
  return items.filter((item) => stored.includes(item))
}

export const rememberedText = (memory: Memory) =>
  IS_DEBUG ? null : readStored(MEMORY_KEYS[memory])

export function rememberText(memory: Memory, text: string) {
  if (!IS_DEBUG) writeStored(MEMORY_KEYS[memory], text)
}

export function forgetProgress() {
  for (const memory of PROGRESS_MEMORIES) forgetStored(MEMORY_KEYS[memory])
}

export function rememberItem(memory: Memory, item: string) {
  if (IS_DEBUG) return
  const items = new Set(storedItems(memory).filter(Boolean)).add(item)
  writeStored(MEMORY_KEYS[memory], [...items].join(','))
}

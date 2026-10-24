import { IS_DEBUG } from '@/app/experience/constants'
import { readStored, writeStored } from '@/utils/storage'

const MEMORY_KEYS = {
  returningVisitor: 'returning-visitor',
  revealedIslands: 'revealed-islands',
  heardRemarks: 'heard-remarks',
  heardDialogues: 'heard-dialogues',
}

type Memory = keyof typeof MEMORY_KEYS

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

export function rememberItem(memory: Memory, item: string) {
  if (IS_DEBUG) return
  const items = new Set(storedItems(memory).filter(Boolean)).add(item)
  writeStored(MEMORY_KEYS[memory], [...items].join(','))
}

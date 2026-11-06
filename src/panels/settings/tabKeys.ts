export function tabPositionAfterKey(key: string, position: number, count: number): number | null {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowLeft') return (position - 1 + count) % count
  if (key === 'ArrowRight') return (position + 1) % count
  return null
}

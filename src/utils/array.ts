export function retain<T>(items: T[], keep: (item: T) => boolean): void {
  let write = 0
  for (const item of items) {
    if (keep(item)) items[write++] = item
  }
  items.length = write
}

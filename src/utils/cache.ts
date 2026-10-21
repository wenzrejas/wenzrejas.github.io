export function onceFor<K extends object, V>(cache: WeakMap<K, V>, key: K, build: () => V): V {
  const cached = cache.get(key)
  if (cached !== undefined) return cached
  const built = build()
  cache.set(key, built)
  return built
}

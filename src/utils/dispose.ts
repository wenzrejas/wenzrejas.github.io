interface Disposable {
  dispose: () => void
}

export function disposeAll(...resources: (Disposable | null | undefined)[]) {
  for (const resource of resources) resource?.dispose()
}

export const glslFloat = (value: number) =>
  Number.isInteger(value) ? value.toFixed(1) : String(value)

export const floatDefines = (values: Record<string, number>): Record<string, string> =>
  Object.fromEntries(Object.entries(values).map(([name, value]) => [name, glslFloat(value)]))

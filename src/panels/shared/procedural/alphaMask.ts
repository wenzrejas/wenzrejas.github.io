export function alphaMaskUrl(alphas: Uint8ClampedArray, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  const mask = context.createImageData(width, height)
  for (let i = 0; i < alphas.length; i++) mask.data[i * 4 + 3] = alphas[i]
  context.putImageData(mask, 0, 0)
  return `url(${canvas.toDataURL('image/png')})`
}

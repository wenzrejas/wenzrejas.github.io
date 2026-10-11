export function decodeImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode()
}

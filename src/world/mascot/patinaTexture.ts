import * as THREE from 'three'
import { PATINA } from './constants'

export function createPatinaTexture(): THREE.DataTexture {
  const pixels = new Uint8Array(PATINA.textureSize * PATINA.textureSize * 4)
  let seed = PATINA.seed

  for (let y = 0; y < PATINA.textureSize; y++) {
    for (let x = 0; x < PATINA.textureSize; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0
      const grain = seed / 4294967296 - 0.5
      const wash = Math.sin(x / PATINA.washWidth) * Math.sin(y / PATINA.washHeight)
      const brightness = Math.min(
        255,
        PATINA.brightness + grain * PATINA.grainContrast + wash * PATINA.washContrast
      )
      const offset = (y * PATINA.textureSize + x) * 4
      pixels[offset] = brightness
      pixels[offset + 1] = brightness
      pixels[offset + 2] = brightness
      pixels[offset + 3] = 255
    }
  }

  const texture = new THREE.DataTexture(pixels, PATINA.textureSize, PATINA.textureSize)
  texture.name = 'Soft brass patina'
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true
  return texture
}

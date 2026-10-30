import * as THREE from 'three'
import { sizeBloomChain, type BloomChain } from './bloomModel'

const _drawingBuffer = new THREE.Vector2()

function fitToCanvas(chain: BloomChain, gl: THREE.WebGLRenderer) {
  const { x: width, y: height } = gl.getDrawingBufferSize(_drawingBuffer)
  if (chain.frame.width !== width || chain.frame.height !== height) {
    sizeBloomChain(chain, width, height)
  }
}

function copyCanvas({ frame }: BloomChain, gl: THREE.WebGLRenderer) {
  const context = gl.getContext() as WebGL2RenderingContext
  gl.setRenderTarget(frame)
  context.bindFramebuffer(context.READ_FRAMEBUFFER, null)
  context.blitFramebuffer(
    0,
    0,
    frame.width,
    frame.height,
    0,
    0,
    frame.width,
    frame.height,
    context.COLOR_BUFFER_BIT,
    context.NEAREST
  )
}

function drawPass(
  { scene, camera, quad }: BloomChain,
  gl: THREE.WebGLRenderer,
  pass: THREE.ShaderMaterial,
  source: THREE.WebGLRenderTarget,
  target: THREE.WebGLRenderTarget | null
) {
  pass.uniforms.uSource.value = source.texture
  pass.uniforms.uSourceTexel.value.set(1 / source.width, 1 / source.height)
  quad.material = pass
  gl.setRenderTarget(target)
  gl.render(scene, camera)
}

export function warmBloom(chain: BloomChain, gl: THREE.WebGLRenderer) {
  const { scene, camera, quad, levels, prefilter, downsample, upsample, composite } = chain
  gl.setRenderTarget(levels[0])
  for (const pass of [prefilter, downsample, upsample]) {
    quad.material = pass
    gl.compile(scene, camera)
  }
  gl.setRenderTarget(null)
  quad.material = composite
  gl.compile(scene, camera)
}

export function drawBloom(
  chain: BloomChain,
  gl: THREE.WebGLRenderer,
  strength: number,
  threshold: number
) {
  fitToCanvas(chain, gl)
  const { frame, levels, prefilter, downsample, upsample, composite } = chain
  copyCanvas(chain, gl)
  gl.autoClear = false
  prefilter.uniforms.uThreshold.value = threshold
  drawPass(chain, gl, prefilter, frame, levels[0])
  for (let level = 1; level < levels.length; level++) {
    drawPass(chain, gl, downsample, levels[level - 1], levels[level])
  }
  for (let level = levels.length - 1; level > 0; level--) {
    drawPass(chain, gl, upsample, levels[level], levels[level - 1])
  }
  composite.uniforms.uStrength.value = strength
  drawPass(chain, gl, composite, levels[0], null)
  gl.autoClear = true
}

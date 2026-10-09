#include "/shaders/star.glsl"

uniform float uTime;
uniform float uSize;

attribute vec3 aEnd;
attribute vec3 aSeed;

varying float vFlash;

void main() {
  float cycle = uTime / aSeed.x + aSeed.y;
  vFlash = starFlash(cycle, FLASH_SHARE);

  float along = fract(aSeed.z + floor(cycle) * 0.618034);
  vec3 pos = mix(position, aEnd, along) * LIFT;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * vFlash;
}

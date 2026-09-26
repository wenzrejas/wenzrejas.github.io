uniform float uTime;
uniform float uSize;

attribute vec3 aEnd;
attribute vec3 aSeed;

varying float vFlash;

void main() {
  float cycle = uTime / aSeed.x + aSeed.y;
  float flashProgress = fract(cycle) / FLASH_SHARE;
  vFlash = flashProgress < 1.0 ? sin(3.14159265 * flashProgress) : 0.0;

  float along = fract(aSeed.z + floor(cycle) * 0.618034);
  vec3 pos = mix(position, aEnd, along) * LIFT;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * vFlash;
}

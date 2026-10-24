#include "/shaders/star.glsl"

attribute vec3 timing;
attribute vec3 tint;

uniform float uTime;
uniform float uPixelScale;

varying float vFlash;
varying vec3 vTint;

void main() {
  float cycleSeconds = timing.x;
  float phase = timing.y;
  float depthShare = timing.z;
  float flash = starFlash(uTime / cycleSeconds + phase, FLASH_SHARE);

  vec3 drifted = position;
  drifted.x += sin(uTime * DRIFT_RATE + phase * 6.2832) * DRIFT;
  drifted.y += cos(uTime * DRIFT_RATE * 0.7 + phase * 4.0) * DRIFT;

  vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
  float distance = max(-viewPosition.z, 0.001);
  vFlash = flash * STRENGTH * (1.0 + DEEP_BOOST * depthShare) * exp(-distance * FADE_DENSITY);
  vTint = tint;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = SIZE * flash * uPixelScale / distance;
}

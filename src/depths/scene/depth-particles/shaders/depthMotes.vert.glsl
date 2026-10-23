attribute float seed;
attribute vec3 tint;

uniform float uTime;
uniform float uPixelScale;

varying float vAlpha;
varying vec3 vTint;

void main() {
  float rise = fract(seed + uTime * RISE * (0.6 + seed * 0.8) / BAND);
  vec3 drifted = position;
  drifted.y += (rise - 0.5) * BAND;
  drifted.x += sin(uTime * SWAY_RATE + seed * 6.2832) * SWAY;
  drifted.z += cos(uTime * SWAY_RATE * 0.8 + seed * 4.0) * SWAY;

  vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
  float distance = max(-viewPosition.z, 0.001);
  float lifetime = sin(rise * 3.14159);
  float twinkle = 1.0 - TWINKLE * (0.5 + 0.5 * sin(uTime * TWINKLE_RATE * (0.5 + seed) + seed * 40.0));
  vAlpha = STRENGTH * exp(-distance * FADE_DENSITY) * (0.5 + 0.5 * seed) * lifetime * twinkle;
  vTint = tint;
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = SIZE * (0.6 + 0.8 * fract(seed * 7.3)) * uPixelScale / distance;
}

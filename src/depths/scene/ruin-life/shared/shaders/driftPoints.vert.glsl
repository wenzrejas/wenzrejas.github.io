attribute vec4 drift;

uniform float uTime;
uniform float uPixelScale;

varying float vBrightness;

void main() {
  float climb = fract(drift.z + uTime * RISE / HEIGHT);
  float angle = drift.x + uTime * ORBIT;
  vec3 drifted = position + vec3(cos(angle) * drift.y, climb * HEIGHT, sin(angle) * drift.y);
  drifted.x += sin(uTime * 0.7 + drift.w) * SWAY;

  vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
  float distance = max(-viewPosition.z, 0.001);
  vBrightness = sin(climb * 3.14159);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = SIZE * uPixelScale / distance;
}

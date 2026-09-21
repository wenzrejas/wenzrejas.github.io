uniform float uTime;
uniform float uSize;
uniform float uWander;
uniform float uBob;
uniform float uPresence;

attribute vec4 aSeed;

varying float vGlow;

void main() {
  float t = uTime;
  vec3 pos = position;
  pos.x += sin(t * (0.21 + aSeed.x * 0.2) + aSeed.y * 6.28) * uWander;
  pos.z += cos(t * (0.17 + aSeed.y * 0.2) + aSeed.x * 6.28) * uWander;
  pos.y += sin(t * (0.35 + aSeed.z * 0.3) + aSeed.z * 6.28) * uBob;

  float present = smoothstep(aSeed.w, aSeed.w + FADE_BAND, uPresence);
  float pulse = pow(0.5 + 0.5 * sin(t * (1.2 + aSeed.x * 1.6) + aSeed.y * 40.0), 6.0);
  vGlow = present * (0.25 + 0.75 * pulse);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * (0.7 + 0.5 * pulse) * step(0.001, present);
}

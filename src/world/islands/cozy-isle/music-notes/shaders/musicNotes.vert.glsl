uniform float uSeconds;
uniform float uLastLaunch;
uniform float uSize;

attribute vec4 aSeed;

varying float vLife;
varying float vGlyph;
varying float vTilt;
varying float vLaunched;

void main() {
  float age   = uSeconds - aSeed.x * LIFETIME;
  float life  = fract(max(age, 0.0) / LIFETIME);
  float climb = 1.0 - pow(1.0 - life, 1.4);

  vec3 local = position;
  local.y  += climb * RISE;
  local.xz += vec2(cos(aSeed.y), sin(aSeed.y)) * SPREAD * climb;
  local.x  += sin(life * SWAY_RATE + aSeed.y) * SWAY * climb;

  float pop = smoothstep(0.0, POP_SHARE, life);
  float launchedAt = uSeconds - life * LIFETIME;
  vLaunched = step(0.0, age) * step(launchedAt, uLastLaunch);

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(local, 1.0);
  gl_PointSize = uSize * aSeed.z * vLaunched * (pop + POP_OVERSHOOT * sin(pop * 3.14159));
  vLife  = life;
  vGlyph = aSeed.w;
  vTilt  = sin(life * TILT_RATE + aSeed.y) * TILT;
}

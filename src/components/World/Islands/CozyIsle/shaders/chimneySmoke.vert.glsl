uniform float uTime;
uniform float uSize;
uniform vec2  uDrift;

attribute vec3 aSeed;

varying float vLife;
varying float vSeed;

void main() {
  float life  = fract(uTime / LIFETIME + aSeed.x);
  float climb = 1.0 - pow(1.0 - life, 1.7);

  vec3 local = position;
  local.y  += climb * RISE;
  local.xz += vec2(cos(aSeed.y), sin(aSeed.y)) * SPREAD * climb;
  local.xz += vec2(sin(life * 5.0 + aSeed.y), cos(life * 4.0 + aSeed.y * 1.7)) * SWAY * life;

  vec4 world = modelMatrix * vec4(local, 1.0);
  world.xz  += uDrift * pow(life, 1.5);

  gl_Position  = projectionMatrix * viewMatrix * world;
  gl_PointSize = uSize * aSeed.z * mix(1.0, GROWTH, climb);
  vLife = life;
  vSeed = aSeed.y;
}

uniform float uTime;
uniform float uSize;
uniform float uRise;
uniform float uSpread;
uniform float uDrift;
uniform float uSway;

attribute vec3 aSeed;

varying float vLife;

void main() {
  float life  = fract(uTime / LIFETIME + aSeed.x);
  float climb = pow(life, 0.75);
  float angle = aSeed.y;

  vec3 pos = position;
  pos.y += climb * uRise;

  float radius = uSpread + climb * uDrift;
  pos.x += cos(angle) * radius + sin(life * 7.0 + aSeed.x * 30.0) * uSway * life;
  pos.z += sin(angle) * radius + cos(life * 6.0 + aSeed.x * 21.0) * uSway * life;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aSeed.z * (1.0 - life * 0.75);
  vLife = life;
}

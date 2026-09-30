uniform float uTime;
uniform float uSize;
uniform float uRise;
uniform float uGlow;

attribute vec4 aSeed;
attribute float aRadius;
attribute vec3 aColor;

varying float vAlpha;
varying vec3 vColor;

void main() {
  float life = fract(uTime / LIFETIME + aSeed.x);
  float angle = aSeed.y + life * SWIRL;
  float outward = 1.0 - (1.0 - life) * (1.0 - life);
  float radius = aRadius * (aSeed.z + outward * SPREAD);

  vec3 pos = position;
  pos.x += cos(angle) * radius;
  pos.z += sin(angle) * radius;
  pos.y += pow(life, 1.4) * uRise;

  vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.5, 1.0, life)) * uGlow * STRENGTH;
  vColor = aColor;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aSeed.w * (1.0 - 0.5 * life);
}

uniform float uTime;
uniform float uSize;
uniform float uGlow;

attribute vec3 aDirection;
attribute vec2 aSeed;

varying float vAlpha;

void main() {
  float life = fract(uTime / LIFETIME + aSeed.x);
  float radius = mix(REACH, CORE, life * life);
  float swirl = life * SWIRL * aSeed.y;
  float turnCos = cos(swirl);
  float turnSin = sin(swirl);
  vec3 direction = vec3(
    aDirection.x * turnCos - aDirection.z * turnSin,
    aDirection.y,
    aDirection.x * turnSin + aDirection.z * turnCos
  );

  vAlpha = smoothstep(0.0, 0.25, life) * (1.0 - smoothstep(0.85, 1.0, life)) * uGlow;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(direction * radius, 1.0);
  gl_PointSize = uSize * (1.0 - 0.4 * life);
}

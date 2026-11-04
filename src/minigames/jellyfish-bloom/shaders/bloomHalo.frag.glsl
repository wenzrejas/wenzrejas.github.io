#include "/shaders/pointGlow.glsl"

uniform vec3 uTint;

varying vec2 vUv;
varying float vGlow;

void main() {
  float glow = softPointGlow(vUv) * vGlow * HALO_STRENGTH;
  if (glow <= 0.003) discard;
  gl_FragColor = vec4(uTint, glow);
}

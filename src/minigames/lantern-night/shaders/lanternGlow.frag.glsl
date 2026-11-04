#include "/shaders/pointGlow.glsl"

uniform vec3 uColor;

varying vec2 vUv;
varying float vGlow;

void main() {
  float glow = softPointGlow(vUv) * vGlow;
  if (glow <= 0.003) discard;
  gl_FragColor = vec4(uColor, glow);
}

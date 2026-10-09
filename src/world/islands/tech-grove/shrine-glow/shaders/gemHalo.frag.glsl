#include "/shaders/pointGlow.glsl"

uniform float uGlow;

varying vec3 vColor;

void main() {
  float alpha = softPointGlow(gl_PointCoord) * HALO_STRENGTH * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(vColor, alpha);
}

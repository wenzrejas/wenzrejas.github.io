#include "/shaders/pointGlow.glsl"

uniform vec3 uColor;
uniform float uGlow;

varying float vBrightness;

void main() {
  float alpha = softPointGlow(gl_PointCoord) * vBrightness * STRENGTH * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

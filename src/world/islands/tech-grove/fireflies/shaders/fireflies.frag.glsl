#include "/shaders/pointGlow.glsl"

uniform vec3 uColor;

varying float vGlow;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float alpha = moteGlow(fromCenter, moteCore(fromCenter, 0.18)) * vGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

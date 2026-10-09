#include "/shaders/pointGlow.glsl"

uniform vec3  uColor;
uniform float uGlow;

varying float vFlash;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float core  = moteCore(fromCenter, 0.15);
  float alpha = moteGlow(fromCenter, core) * vFlash * uGlow * STRENGTH;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5), alpha);
}

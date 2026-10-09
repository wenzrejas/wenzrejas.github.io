#include "/shaders/pointGlow.glsl"

varying float vAlpha;
varying vec3 vColor;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float core = moteCore(fromCenter, 0.2);
  float alpha = moteGlow(fromCenter, core) * vAlpha;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.5), alpha);
}

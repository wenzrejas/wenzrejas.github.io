#include "/shaders/pointGlow.glsl"

uniform vec3 uGlowColor;
uniform vec3 uMagicColor;

varying float vAlpha;
varying float vShare;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float core = moteCore(fromCenter, 0.2);
  float alpha = moteGlow(fromCenter, core) * vAlpha;
  if (alpha <= 0.003) discard;

  vec3 tone = mix(uGlowColor, uMagicColor, smoothstep(0.15, 0.85, vShare));
  gl_FragColor = vec4(mix(tone, vec3(1.0), core * 0.5), alpha);
}

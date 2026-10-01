#include "../../../../../utils/noise.glsl"

uniform vec3 uColor;
uniform float uGlow;
uniform float uTime;

varying vec2 vOffset;

void main() {
  float fromCenter = length(vOffset);
  float plasma = noise(vOffset * PLASMA_SCALE + uTime * PLASMA_DRIFT);
  float core = 1.0 - smoothstep(CORE_SHARE * 0.6, CORE_SHARE, fromCenter);
  float halo = pow(max(0.0, 1.0 - fromCenter), 2.5) * (0.6 + 0.8 * plasma);
  float alpha = (core + halo) * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), alpha);
}

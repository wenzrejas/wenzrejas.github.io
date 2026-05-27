#include "../../../../utils/noise.glsl"

uniform float uTime;
uniform float uFadeProgress;  // 0 = fully visible, 1.1 = fully gone
uniform float uInvActiveMax;  // (WAKE_LEN-1)/(size-1): remaps vUv.y so oldest point = 1.0
uniform vec3 uColor;
varying vec2  vUv;
varying vec2  vWorldPos;

void main() {
  // Quantised noise — same pixel-art jag as hull foam
  float n  = noise(vWorldPos * 0.80 + vec2(uTime * 0.06, -uTime * 0.05));
  float nq = floor(n * 4.0) / 4.0;

  float outerJag = 0.14 + (nq - 0.30) * 0.38;
  float innerJag = 0.84 - (nq - 0.30) * 0.32;
  if (vUv.x < outerJag || vUv.x > innerJag) discard;

  // Remap so oldest active point always = 1.0
  float normAge = clamp(vUv.y * uInvActiveMax, 0.0, 1.0);
  float ageFade = pow(1.0 - normAge, 1.4);

  // Sweep dissolve: tail disappears first, front last
  float aliveThresh = 1.0 - uFadeProgress;
  float fadeSweep   = 1.0 - smoothstep(aliveThresh - 0.10, aliveThresh + 0.10, vUv.y);
  if (fadeSweep <= 0.0) discard;

  float alpha = ageFade * fadeSweep * 0.80;

  gl_FragColor = vec4(uColor, alpha);
}

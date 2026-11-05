#include "/shaders/noise.glsl"
#include "/world/wildlife/algae/shaders/algaeMask.glsl"

uniform float uTime;
uniform float uFadeProgress;
uniform float uInvActiveMax;
uniform vec3 uColor;
varying vec2  vUv;
varying vec2  vWorldPos;

void main() {
  float noiseValue  = noise(vWorldPos * 0.80 + vec2(uTime * 0.06, -uTime * 0.05));
  float steppedNoise = floor(noiseValue * 4.0) / 4.0;

  float outerJag = 0.14 + (steppedNoise - 0.30) * 0.38;
  float innerJag = 0.84 - (steppedNoise - 0.30) * 0.32;
  if (vUv.x < outerJag || vUv.x > innerJag) discard;

  float normAge = clamp(vUv.y * uInvActiveMax, 0.0, 1.0);
  float ageFade = pow(1.0 - normAge, 1.4);

  float aliveThresh = 1.0 - uFadeProgress;
  float fadeSweep   = 1.0 - smoothstep(aliveThresh - 0.10, aliveThresh + 0.10, vUv.y);
  if (fadeSweep <= 0.0) discard;

  float alpha = ageFade * fadeSweep * 0.80;

  float glow = algaeMask(vWorldPos);
  gl_FragColor = vec4(mix(uColor, uAlgaeGlow, glow), mix(alpha, min(1.0, alpha * 1.5), glow));
}

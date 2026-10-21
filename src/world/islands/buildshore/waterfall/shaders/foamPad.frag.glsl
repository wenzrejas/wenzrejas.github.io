#include "./waterfallFoam.glsl"

uniform float uFlowTime;
uniform vec3  uFoamColor;

varying vec2  vUv;
varying float vSeed;

void main() {
  float cells     = foamCells(vUv, vec2(0.0, -uFlowTime * PAD_FLOW), vSeed);
  float spread    = max(vUv.y, abs(vUv.x - 0.5) * 2.0);
  float threshold = mix(FOAM_DENSE, 1.0, smoothstep(0.0, 1.0, spread));
  if (cells < threshold) discard;
  gl_FragColor = vec4(uFoamColor, 1.0);
}

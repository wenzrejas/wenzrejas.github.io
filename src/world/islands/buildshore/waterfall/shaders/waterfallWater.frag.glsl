#include "/world/environment/ocean/shaders/oceanSurface.glsl"
#include "./waterfallFoam.glsl"

uniform float uFlowTime;
uniform vec3  uFoamColor;

varying vec2 vFlowUv;
varying vec2 vFlow;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  float fromBank = abs(vFlowUv.x - 0.5) * 2.0;
  float cells    = foamCells(vFlowUv, vec2(0.0, uFlowTime * vFlow.y), vFlow.x);

#ifdef FALLING
  float fromEnd   = min(vFlowUv.y, 1.0 - vFlowUv.y);
  float threshold = mix(FOAM_DENSE, FOAM_SPARSE, smoothstep(0.0, FOAM_END_REACH, fromEnd));
#else
  float threshold = mix(FOAM_SPARSE, FOAM_DENSE, fromBank * fromBank);
#endif

  float tone    = mix(TONE_BASE, TONE_PEAK, fromBank * fromBank * fromBank) * uMidPos;
  vec4  surface = oceanSurface(tone, vWorldNormal, vWorldPosition);
  gl_FragColor  = vec4(mix(surface.rgb, uFoamColor, step(threshold, cells) * FOAM_STRENGTH), 1.0);
}

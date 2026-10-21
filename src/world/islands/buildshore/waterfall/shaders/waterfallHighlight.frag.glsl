#include "/world/environment/ocean/shaders/oceanSurface.glsl"

uniform float uFlowTime;
uniform vec3  uFoamColor;

varying vec2 vFlowUv;
varying vec2 vFlow;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  float dash = fract((vFlowUv.y + uFlowTime * vFlow.y) * HIGHLIGHT_DASHES + vFlow.x);
  if (dash > HIGHLIGHT_DASH_SHARE) discard;
  vec3 water = oceanSurface(TONE_BASE * uMidPos, vWorldNormal, vWorldPosition).rgb;
  gl_FragColor = vec4(mix(water, uFoamColor, HIGHLIGHT_STRENGTH), 1.0);
}

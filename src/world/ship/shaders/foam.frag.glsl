#include "/shaders/noise.glsl"
#include "/shaders/foam.glsl"

uniform sampler2D uHullField;
uniform float uModelScale;
uniform float uReach;
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
varying vec2 vHullPoint;

void main() {
  float waterlineGap = texture2D(uHullField, vUv).r * uModelScale;
  float jag = foamJag(vHullPoint * uModelScale * FOAM_GRAIN, uTime) * FOAM_JAG;
  if (waterlineGap + jag > uReach) discard;
  gl_FragColor = vec4(uColor, FOAM_OPACITY);
}

#include "/shaders/noise.glsl"
#include "/shaders/foam.glsl"

uniform float uTime;
uniform vec3 uColor;

varying vec2 vAround;
varying vec2 vWorld;
varying float vFoam;

void main() {
  if (vFoam <= 0.003) discard;
  float jag = foamJag(vWorld * RING_FOAM_GRAIN, uTime) * RING_FOAM_JAG;
  float breathe = sin(uTime * RING_FOAM_BREATHE_RATE) * RING_FOAM_BREATHE;
  float speck = noise(vWorld * RING_FOAM_SPECK_GRAIN + vec2(uTime * 0.5, -uTime * 0.35));
  if (length(vAround) + jag + speck * RING_FOAM_SPECK > RING_FOAM_REACH + breathe) discard;
  gl_FragColor = vec4(uColor, FOAM_OPACITY * vFoam);
}

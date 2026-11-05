#include "/minigames/checkpoint-run/shaders/aboveWater.glsl"

uniform vec3 uColor;
uniform float uPresence;

varying vec3 vNormal;
varying vec3 vViewDirection;
varying float vAboveWater;
varying float vGlow;
varying float vPulse;

void main() {
  float facing = abs(dot(normalize(vNormal), normalize(vViewDirection)));
  float shine = ARCH_CORE_GLOW + ARCH_RIM_GLOW * pow(1.0 - facing, 2.0);
  float solid = max(min(1.0, vGlow / SOLID_ARCH_GLOW), min(1.0, vPulse));
  float alpha = solid * uPresence * aboveWaterShare(vAboveWater);
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor * shine * (0.75 + 0.5 * vGlow + ARCH_PULSE_SHINE * vPulse), alpha);
}

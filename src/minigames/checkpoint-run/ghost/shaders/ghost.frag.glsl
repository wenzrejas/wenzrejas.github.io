#include "/minigames/checkpoint-run/shaders/aboveWater.glsl"

uniform vec3 uColor;
uniform float uOpacity;

varying float vAboveWater;

void main() {
  float alpha = GHOST_LINE_ALPHA * uOpacity * aboveWaterShare(vAboveWater);
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

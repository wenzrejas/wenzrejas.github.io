#include "/world/environment/ocean/shaders/waveSines.glsl"

float crestGlow(float ride) {
  return mix(CREST_DIM, CREST_BRIGHT, smoothstep(-0.4, 0.6, ride));
}

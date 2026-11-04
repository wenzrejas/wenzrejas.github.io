#include "/world/environment/ocean/shaders/waveSines.glsl"

float waveRideAt(vec2 xz) {
  return waveSines(xz).x * shoreCalm(xz);
}

float crestGlow(float ride) {
  return mix(CREST_DIM, CREST_BRIGHT, smoothstep(-0.4, 0.6, ride));
}

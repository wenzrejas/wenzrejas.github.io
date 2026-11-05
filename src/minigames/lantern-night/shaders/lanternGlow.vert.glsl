#include "/world/environment/ocean/shaders/waveRide.glsl"

attribute float aGlow;
attribute float aAfloat;

varying vec2 vUv;
varying float vGlow;

void main() {
  float ride = waveRideAt(instanceMatrix[3].xz);
  vec4 world = instanceMatrix * vec4(position, 1.0);
  world.y += ride * uWaveAmplitude * aAfloat;
  vUv = uv;
  vGlow = aGlow * mix(1.0, crestGlow(ride), aAfloat);
  gl_Position = projectionMatrix * viewMatrix * world;
}

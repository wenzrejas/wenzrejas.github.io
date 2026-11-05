#include "/world/environment/ocean/shaders/waveSines.glsl"

varying float vAboveWater;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vAboveWater = world.y - waveRideAt(world.xz) * uWaveAmplitude;
  gl_Position = projectionMatrix * viewMatrix * world;
}

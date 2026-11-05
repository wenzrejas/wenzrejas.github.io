#include "/world/environment/ocean/shaders/waveSines.glsl"

attribute float aFoam;

varying vec2 vAround;
varying vec2 vWorld;
varying float vFoam;

void main() {
  vec3 spot = instanceMatrix[3].xyz;
  vec4 world = instanceMatrix * vec4(position, 1.0);
  world.y += waveRideAt(spot.xz) * uWaveAmp;
  vAround = world.xz - spot.xz;
  vWorld = world.xz;
  vFoam = aFoam;
  gl_Position = projectionMatrix * viewMatrix * world;
}

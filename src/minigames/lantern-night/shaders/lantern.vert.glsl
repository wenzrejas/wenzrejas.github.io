#include "/world/environment/ocean/shaders/waveRide.glsl"

attribute vec2 shape;
attribute float aLit;
attribute float aSeed;
attribute float aPresence;
attribute float aAfloat;

varying vec2 vShape;
varying vec2 vAround;
varying vec3 vWorldNormal;
varying vec3 vViewNormal;
varying float vLit;
varying float vSeed;
varying float vPresence;
varying float vCrest;

void main() {
  vec3 spot = instanceMatrix[3].xyz;
  vec3 wave = waveSines(spot.xz) * shoreCalm(spot.xz);
  vec2 slope = wave.yz * uWaveAmp * WAVE_TILT * aAfloat;

  vec4 world = instanceMatrix * vec4(position, 1.0);
  vec3 reach = world.xyz - spot;
  world.x -= slope.x * reach.y;
  world.z -= slope.y * reach.y;
  world.y += slope.x * reach.x + slope.y * reach.z + wave.x * uWaveAmp * aAfloat;

  vShape = shape;
  vAround = position.xz;
  vWorldNormal = mat3(instanceMatrix) * normal;
  vViewNormal = mat3(viewMatrix) * vWorldNormal;
  vLit = aLit;
  vSeed = aSeed;
  vPresence = aPresence;
  vCrest = mix(1.0, crestGlow(wave.x), aAfloat);
  gl_Position = projectionMatrix * viewMatrix * world;
}

#include "/world/environment/ocean/shaders/waveRide.glsl"

attribute vec3 origin;
attribute float aGlow;
attribute float bellRadius;

uniform float uScale;

varying vec2 vUv;
varying float vGlow;

void main() {
  float radius = bellRadius * uScale;
  float ride = waveRideAt(origin.xz);
  float height = origin.y + radius * HALO_LIFT + ride * uWaveAmplitude;
  vec4 viewPosition = viewMatrix * vec4(origin.x, height, origin.z, 1.0);
  viewPosition.xy += position.xy * radius * HALO_SIZE;
  vUv = uv;
  vGlow = aGlow * crestGlow(ride);
  gl_Position = projectionMatrix * viewPosition;
}

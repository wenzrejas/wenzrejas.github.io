#include "/world/environment/ocean/shaders/waveSines.glsl"

attribute float aGlow;
attribute float aPulse;

varying vec3 vNormal;
varying vec3 vViewDirection;
varying float vAboveWater;
varying float vGlow;
varying float vPulse;

void main() {
  vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vViewDirection = normalize(cameraPosition - worldPosition.xyz);
  vAboveWater = worldPosition.y - waveRideAt(worldPosition.xz) * uWaveAmplitude;
  vGlow = aGlow;
  vPulse = aPulse;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}

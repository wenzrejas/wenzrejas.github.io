#include "./waves.glsl"

varying vec2 vWorldPos;
varying vec3 vPos;
varying vec3 vNormal;
varying float vWaveHeight;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec3 wave = waveField(worldPos.xz);
  float calm = shoreCalm(worldPos.xz);

  float amp = uWaveAmp * calm;

  vWaveHeight = wave.x * calm;
  worldPos.y += wave.x * amp;

  vNormal   = normalize(vec3(-wave.y * amp, 1.0, -wave.z * amp));
  vWorldPos = worldPos.xz;
  vPos      = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

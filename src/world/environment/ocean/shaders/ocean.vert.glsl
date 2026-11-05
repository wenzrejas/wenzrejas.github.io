#include "./waves.glsl"
#include "/world/islands/timewell-depth/whirlpoolFunnel.glsl"

varying vec2 vWorldPos;
varying vec3 vPos;
varying vec3 vNormal;
varying float vWaveHeight;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec3 wave = waveField(worldPos.xz);
  float whirlpoolCalm = smoothstep(1.0, WHIRLPOOL_CALM_REACH, whirlpoolShare(worldPos.xz));
  float calm = shoreCalm(worldPos.xz) * whirlpoolCalm;

  float amplitude = uWaveAmplitude * calm;

  vWaveHeight = wave.x * calm;
  worldPos.y += wave.x * amplitude;
  worldPos.y -= whirlpoolDip(worldPos.xz) * FUNNEL_OVERSHOOT;

  vNormal   = normalize(vec3(-wave.y * amplitude, 1.0, -wave.z * amplitude));
  vWorldPos = worldPos.xz;
  vPos      = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

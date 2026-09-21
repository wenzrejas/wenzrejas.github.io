#include "../../Ocean/shaders/waves.glsl"

varying vec2  vWorld;
varying float vWave;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec3 wave = waveField(world.xz);
  float calm = shoreCalm(world.xz);
  vWorld = world.xz;
  vWave = wave.x * calm;
  world.y += wave.x * uWaveAmp * calm;
  gl_Position = projectionMatrix * viewMatrix * world;
}

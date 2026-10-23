#include "./splashDrift.glsl"

attribute vec3 velocity;
attribute float birth;
attribute vec4 traits;

uniform float uTime;
uniform float uPixelScale;

varying float vAlpha;

void main() {
  float size = traits.x;
  float life = traits.y;
  float riseSpeed = traits.z;
  float seed = traits.w;
  float age = uTime - birth;
  if (age < 0.0 || age > life) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }

  float wobble = WOBBLE * min(age, 1.0);
  vec3 drifted = splashDrift(position, velocity, age, riseSpeed);
  drifted.x += sin(age * WOBBLE_RATE + seed * 6.2832) * wobble;
  drifted.z += cos(age * WOBBLE_RATE * 0.8 + seed * 4.0) * wobble;

  vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
  float distance = max(-viewPosition.z, 0.001);
  vAlpha = STRENGTH * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.55, 1.0, age / life));
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = max(size * uPixelScale / distance, 1.5);
}

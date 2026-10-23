#include "./splashDrift.glsl"

attribute vec3 velocity;
attribute float birth;
attribute vec4 traits;

uniform float uTime;
uniform float uPixelScale;

varying float vAlpha;
varying float vSeed;

void main() {
  float startSize = traits.x;
  float endSize = traits.y;
  float life = traits.z;
  vSeed = traits.w;
  float age = uTime - birth;
  if (age < 0.0 || age > life) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }

  vec4 viewPosition = modelViewMatrix * vec4(splashDrift(position, velocity, age, RISE), 1.0);
  float distance = max(-viewPosition.z, 0.001);
  float size = mix(startSize, endSize, 1.0 - exp(-GROWTH * age));
  vAlpha = STRENGTH * smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.25, 1.0, age / life));
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = size * uPixelScale / distance;
}

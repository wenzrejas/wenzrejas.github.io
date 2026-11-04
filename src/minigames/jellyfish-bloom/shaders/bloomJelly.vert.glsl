#include "/world/environment/ocean/shaders/waveRide.glsl"

attribute vec3 shape;
attribute vec3 origin;
attribute float aGlow;
attribute float bellRadius;
attribute float seed;

uniform float uScale;
uniform vec3 uTint;

varying vec3 vTint;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
varying float vFade;
varying float vTentacle;
varying float vAlong;

vec2 leaned(vec2 point, float angle) {
  float c = cos(angle), s = sin(angle);
  return vec2(c * point.x - s * point.y, s * point.x + c * point.y);
}

void main() {
  float isTentacle = shape.x;
  float along = shape.y;
  float strand = shape.z;

  float pulses = uTime / (PULSE_SECONDS * (0.8 + 0.4 * seed)) + seed;
  float cycle = fract(pulses);
  float squeeze = smoothstep(0.0, 0.22, cycle) * (1.0 - smoothstep(0.22, 1.0, cycle));

  vec3 local = position;
  local.xz *= 1.0 - squeeze * PULSE_SQUEEZE * (1.0 - along);
  local.y *= 1.0 + squeeze * PULSE_SQUEEZE * 0.6 * (1.0 - isTentacle);
  float reach = along * isTentacle;
  local.x += sin(uTime * TENTACLE_SWAY_RATE + seed * 6.2832 + strand * 2.4 - along * 3.0) * TENTACLE_SWAY * reach;
  local.z += cos(uTime * TENTACLE_SWAY_RATE * 0.8 + seed * 4.0 + strand * 1.7) * TENTACLE_SWAY * 0.5 * reach;
  local.y -= squeeze * TENTACLE_TRAIL * reach;

  float lean = sin(uTime * LEAN_RATE + seed * 3.0) * LEAN;
  local.xy = leaned(local.xy, lean);
  vec3 bent = vec3(leaned(normal.xy, lean), normal.z);

  float ride = waveRideAt(origin.xz);
  vec3 world = origin + local * bellRadius * uScale;
  world.x += sin(world.z * WOBBLE_GRAIN + uTime * WOBBLE_RATE) * WOBBLE_SIZE;
  world.z += cos(world.x * WOBBLE_GRAIN + uTime * WOBBLE_RATE * 0.8) * WOBBLE_SIZE;
  world.y += ride * uWaveAmp;

  vec4 viewPosition = viewMatrix * vec4(world, 1.0);
  vViewNormal = normalize(mat3(viewMatrix) * bent);
  vViewDirection = vec3(0.0, 0.0, 1.0);
  vFade = aGlow * crestGlow(ride);
  vTint = uTint;
  vTentacle = isTentacle;
  vAlong = along;
  gl_Position = projectionMatrix * viewPosition;
}

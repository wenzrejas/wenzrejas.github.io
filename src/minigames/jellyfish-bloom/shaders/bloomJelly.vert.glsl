#include "/world/environment/ocean/shaders/waveRide.glsl"

#include "/world/wildlife/shared/jellyfish-shape/shaders/jellyfishBody.vert.glsl"

attribute float aGlow;

uniform float uScale;
uniform vec3 uTint;

void main() {
  float squeeze = pulseSqueeze(fract(pulseCount()));
  vec3 local = pulsingBody(squeeze);

  float lean = sin(uTime * LEAN_RATE + seed * 3.0) * LEAN;
  local.xy = leaned(local.xy, lean);
  vec3 bent = vec3(leaned(normal.xy, lean), normal.z);

  float ride = waveRideAt(origin.xz);
  vec3 world = origin + local * bellRadius * uScale;
  world.x += sin(world.z * WOBBLE_GRAIN + uTime * WOBBLE_RATE) * WOBBLE_SIZE;
  world.z += cos(world.x * WOBBLE_GRAIN + uTime * WOBBLE_RATE * 0.8) * WOBBLE_SIZE;
  world.y += ride * uWaveAmplitude;

  vec4 viewPosition = viewMatrix * vec4(world, 1.0);
  vViewNormal = normalize(mat3(viewMatrix) * bent);
  vViewDirection = vec3(0.0, 0.0, 1.0);
  vFade = aGlow * crestGlow(ride);
  vTint = uTint;
  vTentacle = shape.x;
  vAlong = shape.y;
  gl_Position = projectionMatrix * viewPosition;
}

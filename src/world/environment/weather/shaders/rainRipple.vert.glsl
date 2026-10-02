#include "/world/islands/timewell-depth/whirlpoolFunnel.glsl"

attribute float aProgress; // 0=just spawned → 1=fully expanded (per instance)
attribute vec2  aCenter;   // world XZ spawn position (per instance)

uniform float uWhirlpoolDrain;

varying float vProgress;
varying vec2  vUV;         // 0..1 across the quad face
varying float vSwallowed;

float drainedShare(float share, float age, float closestShare) {
  float root = sqrt(share);
  float drainedRoot = max(root - uWhirlpoolDrain * age, min(root, sqrt(closestShare)));
  return drainedRoot * drainedRoot;
}

vec2 carryBySwirl(vec2 point, float age) {
  vec2 fromEye = point - uWhirlpool.xy;
  float share = whirlpoolShare(point);
  float carriedShare = drainedShare(share, age, WHIRLPOOL_EYE_SHARE);
  float angle = atan(fromEye.y, fromEye.x) - uWhirlpoolShape.y * log(share / carriedShare);
  return uWhirlpool.xy + vec2(cos(angle), sin(angle)) * length(fromEye) * carriedShare / share;
}

void main() {
  vProgress = aProgress;

  // position.xz ranges -1..1 from the flat XZ quad
  vUV = position.xz * 0.5 + 0.5;

  // Scale quad from 0 → max radius as ring expands
  float radius = aProgress * 7.0;

  float age = aProgress * RIPPLE_LIFETIME;
  float centerShare = whirlpoolShare(aCenter);
  float swirled = 1.0 - smoothstep(0.85, 1.0, centerShare);
  float carriedCenter = drainedShare(centerShare, age, 0.0);
  vSwallowed =
    swirled * (1.0 - smoothstep(WHIRLPOOL_EYE_SHARE, WHIRLPOOL_SWALLOW_SHARE, carriedCenter));

  vec2 rest = aCenter + position.xz * radius;
  vec2 ground = mix(rest, carryBySwirl(rest, age), swirled);

  vec3 worldPos = vec3(ground.x, 0.15 - whirlpoolDip(ground), ground.y);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}

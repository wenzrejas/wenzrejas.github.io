attribute vec3 tint;
attribute float laneSpan;

uniform float uTime;

#include "/world/wildlife/shared/jellyfish-shape/shaders/jellyfishBody.vert.glsl"

void main() {
  float pulses = pulseCount();
  float cycle = fract(pulses);
  float squeeze = pulseSqueeze(cycle);
  float glide = 1.0 - pow(1.0 - cycle, 3.0);
  float travel = (floor(pulses) + glide) * SWIM_STRIDE * bellRadius;
  float laneShare = fract(travel / laneSpan + seed);
  float heading = (fract(seed * 7.13) - 0.5) * 2.0 * SWIM_TILT;
  vec2 course = leaned(vec2(0.0, 1.0), heading) * (laneShare - 0.5) * laneSpan;

  vec3 local = pulsingBody(squeeze);

  float lean = heading + sin(uTime * DRIFT_RATE * 2.0 + seed * 3.0) * LEAN;
  local.xy = leaned(local.xy, lean);
  vec3 bent = vec3(leaned(normal.xy, lean), normal.z);

  vec3 drift = vec3(
    sin(uTime * DRIFT_RATE + seed * 9.0),
    0.0,
    0.5 * cos(uTime * DRIFT_RATE * 0.7 + seed * 5.0)
  ) * DRIFT_ACROSS;
  vec3 world = origin + drift + vec3(course, 0.0) + local * bellRadius;

  vec4 viewPosition = viewMatrix * vec4(world, 1.0);
  float laneEnds = smoothstep(0.0, LANE_FADE, laneShare) * smoothstep(0.0, LANE_FADE, 1.0 - laneShare);
  vViewNormal = normalize(mat3(viewMatrix) * bent);
  vViewDirection = normalize(-viewPosition.xyz);
  vFade = exp(-length(viewPosition.xyz) * FADE_DENSITY) * laneEnds;
  vTint = tint;
  vTentacle = shape.x;
  vAlong = shape.y;
  gl_Position = projectionMatrix * viewPosition;
}

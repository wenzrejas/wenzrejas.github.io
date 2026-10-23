attribute vec3 shape;
attribute vec3 origin;
attribute float bellRadius;
attribute float seed;
attribute vec3 tint;
attribute float laneSpan;

uniform float uTime;

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
  float glide = 1.0 - pow(1.0 - cycle, 3.0);
  float travel = (floor(pulses) + glide) * SWIM_STRIDE * bellRadius;
  float laneShare = fract(travel / laneSpan + seed);
  float heading = (fract(seed * 7.13) - 0.5) * 2.0 * SWIM_TILT;
  vec2 course = leaned(vec2(0.0, 1.0), heading) * (laneShare - 0.5) * laneSpan;

  vec3 local = position;
  local.xz *= 1.0 - squeeze * PULSE_SQUEEZE * (1.0 - along);
  local.y *= 1.0 + squeeze * PULSE_SQUEEZE * 0.6 * (1.0 - isTentacle);
  float reach = along * isTentacle;
  local.x += sin(uTime * TENTACLE_SWAY_RATE + seed * 6.2832 + strand * 2.4 - along * 3.0) * TENTACLE_SWAY * reach;
  local.z += cos(uTime * TENTACLE_SWAY_RATE * 0.8 + seed * 4.0 + strand * 1.7) * TENTACLE_SWAY * 0.5 * reach;
  local.y -= squeeze * TENTACLE_TRAIL * reach;

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
  vTentacle = isTentacle;
  vAlong = along;
  gl_Position = projectionMatrix * viewPosition;
}

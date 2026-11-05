attribute vec3 shape;
attribute vec3 origin;
attribute float bellRadius;
attribute float seed;

varying vec3 vTint;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
varying float vFade;
varying float vTentacle;
varying float vAlong;

vec2 leaned(vec2 point, float angle) {
  float cosine = cos(angle), sine = sin(angle);
  return vec2(cosine * point.x - sine * point.y, sine * point.x + cosine * point.y);
}

float pulseCount() {
  return uTime / (PULSE_SECONDS * (0.8 + 0.4 * seed)) + seed;
}

float pulseSqueeze(float cycle) {
  return smoothstep(0.0, 0.22, cycle) * (1.0 - smoothstep(0.22, 1.0, cycle));
}

vec3 pulsingBody(float squeeze) {
  float isTentacle = shape.x;
  float along = shape.y;
  float strand = shape.z;

  vec3 local = position;
  local.xz *= 1.0 - squeeze * PULSE_SQUEEZE * (1.0 - along);
  local.y *= 1.0 + squeeze * PULSE_SQUEEZE * 0.6 * (1.0 - isTentacle);
  float reach = along * isTentacle;
  local.x += sin(uTime * TENTACLE_SWAY_RATE + seed * 6.2832 + strand * 2.4 - along * 3.0) * TENTACLE_SWAY * reach;
  local.z += cos(uTime * TENTACLE_SWAY_RATE * 0.8 + seed * 4.0 + strand * 1.7) * TENTACLE_SWAY * 0.5 * reach;
  local.y -= squeeze * TENTACLE_TRAIL * reach;
  return local;
}

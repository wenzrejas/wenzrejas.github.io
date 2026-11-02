attribute float aPhase;
attribute float aArch;
attribute float aFade;

varying float vFade;

vec3 deformDolphin(vec3 point) {
  float bend = clamp((0.1 - point.z) / 0.6, 0.0, 1.0);
  point.y += sin(aPhase - bend * 2.0) * 0.06 * bend * bend;

  float curve = (aArch + REST_ARCH) * 2.0;
  float behind = min(point.z - ARCH_START, 0.0);
  float turn = curve * behind;
  return vec3(
    point.x,
    point.y * cos(turn) - (1.0 - cos(turn)) / curve,
    point.z - behind + sin(turn) / curve + point.y * sin(turn)
  );
}

vec3 deformDolphinNormal(vec3 normal) {
  float turn = (aArch + REST_ARCH) * 2.0 * min(position.z - ARCH_START, 0.0);
  return vec3(
    normal.x,
    normal.y * cos(turn) - normal.z * sin(turn),
    normal.y * sin(turn) + normal.z * cos(turn)
  );
}

attribute float aPhase;
attribute float aArch;
attribute float aFade;

varying float vFade;

vec3 deformDolphin(vec3 point) {
  float bend = clamp((0.1 - point.z) / 0.6, 0.0, 1.0);
  point.y += sin(aPhase - bend * 2.0) * 0.06 * bend * bend;
  point.y -= aArch * point.z * point.z;
  return point;
}

attribute float aPhase;
attribute float aFade;

varying float vFade;

vec3 wagTail(vec3 point) {
  float bend = clamp(0.5 - point.z, 0.0, 1.0);
  point.x += sin(aPhase - bend * WAG_LAG) * WAG_AMPLITUDE * bend * bend;
  return point;
}

attribute float aFront;
attribute float aRear;
attribute float aPhase;
attribute float aFade;

varying float vFade;

vec3 paddleFlippers(vec3 point) {
  float stroke = sin(aPhase);
  point.y += aFront * stroke * 0.22;
  point.z += aFront * cos(aPhase) * 0.08;
  point.y += aRear * sin(aPhase + 1.6) * 0.06;
  return point;
}

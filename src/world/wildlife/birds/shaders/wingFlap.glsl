attribute float aLift;

vec3 flapWings(vec3 point) {
  float span = max(abs(point.x) - WING_ROOT, 0.0);
  point.y += aLift * (span + span * span * 1.5);
  point.x -= sign(point.x) * span * abs(aLift) * 0.3;
  return point;
}

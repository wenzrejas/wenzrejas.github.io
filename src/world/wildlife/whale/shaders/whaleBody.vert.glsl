attribute float flipperReach;

uniform float uPhase;
uniform float uTurnCurve;
uniform float uClimbCurve;
uniform float uFade;

varying float vFade;

vec3 swimWhale(vec3 point) {
  float bend = clamp((BEND_START - point.z) / BEND_SPAN, 0.0, 1.0);
  float headShare = clamp((point.z - BEND_START) / (0.5 - BEND_START), 0.0, 1.0);
  float stroke = uPhase - bend * STROKE_LAG;
  point.y += sin(stroke) * STROKE_AMPLITUDE * bend * bend;
  point.x += cos(stroke) * STROKE_SWAY * bend * bend;
  point.y -= sin(uPhase) * HEAD_NOD * headShare;

  float spine = point.z * point.z;
  point.x += uTurnCurve * spine;
  point.y += uClimbCurve * spine;

  float flipperStroke = uPhase * FLIPPER_FREQ;
  point.z += flipperReach * sin(flipperStroke) * FLIPPER_SWEEP;
  point.y += flipperReach * cos(flipperStroke) * FLIPPER_LIFT;
  return point;
}

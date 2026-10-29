attribute float flipperReach;

uniform float uPhase;
uniform float uArch;
uniform float uFade;

varying float vFade;

vec3 swimWhale(vec3 point) {
  float bend = clamp((BEND_START - point.z) / BEND_SPAN, 0.0, 1.0);
  float headShare = clamp((point.z - BEND_START) / (0.5 - BEND_START), 0.0, 1.0);
  point.y += sin(uPhase - bend * STROKE_LAG) * STROKE_AMPLITUDE * bend * bend;
  point.y -= sin(uPhase) * HEAD_NOD * headShare;
  point.y -= uArch * point.z * point.z;

  float flipperStroke = uPhase * FLIPPER_FREQ;
  point.z += flipperReach * sin(flipperStroke) * FLIPPER_SWEEP;
  point.y += flipperReach * cos(flipperStroke) * FLIPPER_LIFT;
  return point;
}

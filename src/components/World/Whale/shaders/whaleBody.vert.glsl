attribute float aFin;

uniform float uPhase;
uniform float uFade;

varying float vFade;

vec3 swimWhale(vec3 point) {
  float bend = clamp((BEND_START - point.z) / BEND_SPAN, 0.0, 1.0);
  point.y += sin(uPhase - bend * STROKE_LAG) * STROKE_AMPLITUDE * bend * bend;
  point.y += aFin * sin(uPhase * FIN_FREQ) * FIN_AMPLITUDE;
  return point;
}

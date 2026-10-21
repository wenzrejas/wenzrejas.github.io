uniform float uArcClock;
uniform float uArcLevel;
uniform vec3  uArcColor;

varying vec2 vIconPlane;

float arcLight() {
  float reach = length(vIconPlane - vec2(WAVE_CENTRE_X, 0.0));
  float arc   = step(INNER_ARC_EDGE, reach) + step(OUTER_ARC_EDGE, reach);
  float since = uArcClock - ARC_FIRST_AT - arc * ARC_STAGGER;
  return clamp(since / ARC_FADE, 0.0, 1.0) * uArcLevel;
}

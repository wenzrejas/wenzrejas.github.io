const float FOAM_OPACITY = 0.70;

float foamJag(vec2 p, float time) {
  float n = noise(p + vec2(0.11, -0.09) * time);
  return floor(n * 6.0) / 6.0 - 0.40;
}

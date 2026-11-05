const float FOAM_OPACITY = 0.70;

float foamJag(vec2 point, float time) {
  float noiseValue = noise(point + vec2(0.11, -0.09) * time);
  return floor(noiseValue * 6.0) / 6.0 - 0.40;
}

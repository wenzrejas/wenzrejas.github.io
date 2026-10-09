vec2 underwaterSway(float time) {
  return vec2(sin(time * SHIMMER_RATE), cos(time * SHIMMER_RATE * 0.8)) * SHIMMER_SWAY;
}

float refractionAt(vec2 point, vec2 sway) {
  return fbm(point * REFRACTION_GRAIN + sway) - 0.5;
}

float shimmerAt(vec2 point, vec2 sway) {
  return fbm(point * SHIMMER_GRAIN + sway);
}

float smin(float first, float other, float blend) {
  float overlap = max(blend - abs(first - other), 0.0) / blend;
  return min(first, other) - overlap * overlap * overlap * blend / 6.0;
}

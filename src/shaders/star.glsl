float ray(float along, float across) {
  float reach = max(0.0, 1.0 - along);
  return reach * (1.0 - smoothstep(0.0, RAY_WIDTH * reach + 0.001, across));
}

float starCore(vec2 offset) {
  return 1.0 - smoothstep(0.0, 0.3, length(offset));
}

float starFlash(float cycle, float share) {
  float progress = fract(cycle) / share;
  return progress < 1.0 ? sin(3.14159265 * progress) : 0.0;
}

float star(vec2 offset) {
  vec2 spread = abs(offset);
  return clamp(max(ray(spread.x, spread.y), ray(spread.y, spread.x)) + starCore(spread), 0.0, 1.0);
}

float hash(float seed) {
  return fract(sin(seed) * 43758.5453);
}

float hash(vec2 point) {
  point = fract(point * vec2(127.1, 311.7));
  point += dot(point, point + 45.32);
  return fract(point.x * point.y);
}

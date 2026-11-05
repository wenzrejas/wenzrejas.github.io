const ivec2 LATTICE_SHIFT = ivec2(32768);
const mat2  OCTAVE_TURN   = mat2(1.6, 1.2, -1.2, 1.6);
const vec2  OCTAVE_SHIFT  = vec2(1.7, 9.2);

float latticeValue(ivec2 corner) {
  uvec2 bits  = uvec2(corner + LATTICE_SHIFT);
  uvec2 mixed = 1103515245u * ((bits >> 1u) ^ bits.yx);
  uint  value = 1103515245u * (mixed.x ^ (mixed.y >> 3u));
  return float(value >> 8u) / 16777215.0;
}

float latticeNoise(vec2 point) {
  ivec2 cell = ivec2(floor(point));
  vec2  fraction    = fract(point);
  vec2  ease = fraction * fraction * fraction * (fraction * (fraction * 6.0 - 15.0) + 10.0);
  return mix(mix(latticeValue(cell),              latticeValue(cell + ivec2(1, 0)), ease.x),
             mix(latticeValue(cell + ivec2(0, 1)), latticeValue(cell + ivec2(1, 1)), ease.x), ease.y);
}

float cloudFbm(vec2 point, int octaves) {
  float total = 0.0, weight = 0.5, weights = 0.0;
  for (int i = 0; i < octaves; i++) {
    total   += weight * latticeNoise(point);
    weights += weight;
    point        = OCTAVE_TURN * point + OCTAVE_SHIFT;
    weight  *= 0.5;
  }
  return total / weights;
}

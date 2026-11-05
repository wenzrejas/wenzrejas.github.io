#include "/shaders/hash.glsl"

float vnoise(vec2 point) {
  vec2 i = floor(point), fraction = fract(point);
  fraction = fraction * fraction * fraction * (fraction * (fraction * 6.0 - 15.0) + 10.0);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), fraction.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), fraction.x),
    fraction.y
  );
}

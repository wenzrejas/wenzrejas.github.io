#include "/shaders/hash.glsl"

float noise(vec2 point) {
  vec2 i = floor(point), fraction = fract(point);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(mix(hash(i),             hash(i + vec2(1,0)), fraction.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), fraction.x), fraction.y);
}

float fbm(vec2 point) {
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(point);
    point  = point * 2.0 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

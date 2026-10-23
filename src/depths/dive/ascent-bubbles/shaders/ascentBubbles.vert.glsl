#include "/shaders/noise.glsl"

attribute vec4 seed;
attribute float layer;

uniform float uTravel;
uniform float uTime;
uniform float uPresence;
uniform float uPixelRatio;

varying float vAlpha;
varying float vSquash;
varying float vSoftness;

float columnOf(float lap) {
  float across = hash(seed.x * 91.7 + lap * 13.3) * 2.0 - 1.0;
  if (seed.w < STREAM_SHARE) {
    float stream = floor(seed.x * STREAMS);
    across = hash(stream * 7.31 + 2.0) * 2.0 - 1.0 + (hash(seed.x * 53.1 + lap) - 0.5) * STREAM_JITTER;
  }
  return sign(across) * pow(abs(across), CENTRE_BIAS);
}

void main() {
  float depth = layer * 0.5;
  float scale = mix(FAR_SCALE, NEAR_SCALE, depth);
  float size = seed.z * seed.z;
  float journey = seed.y + uTravel * (RISE + RISE_PER_SIZE * size) * scale;
  float lap = floor(journey);
  float climb = fract(journey);

  float wobble = sin(uTime * WOBBLE_RATE * (0.6 + seed.w) + seed.y * 6.2832) * WOBBLE * (0.5 + size) * scale;
  float x = columnOf(lap) * (1.0 + FAN * climb) + wobble;
  float y = mix(-1.15, 1.15, climb);
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = mix(SMALLEST_PIXELS, LARGEST_PIXELS, size) * scale * 2.0 * uPixelRatio;

  float ends = smoothstep(0.0, 0.08, climb) * (1.0 - smoothstep(0.88, 1.0, climb));
  vAlpha = uPresence * ends * mix(FAR_ALPHA, NEAR_ALPHA, depth) * (0.6 + 0.4 * seed.w);
  vSquash = sin(uTime * SQUASH_RATE * (0.7 + 0.6 * seed.w) + seed.x * 6.2832) * SQUASH * size;
  vSoftness = mix(0.16, 0.4, depth * depth);
}

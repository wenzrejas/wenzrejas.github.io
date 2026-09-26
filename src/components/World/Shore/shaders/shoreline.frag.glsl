#include "../../../../utils/noise.glsl"
#include "../../../../utils/foam.glsl"

uniform sampler2D uField;
uniform float uFieldSize;
uniform float uIslandScale;
uniform float uTime;
uniform vec3  uColor;

varying vec2 vFieldUv;

float stroke(float offset, float halfWidth, float pixelWidth) {
  float drawnHalfWidth = max(halfWidth, max(pixelWidth * 0.5, 1e-4));
  float edge = pixelWidth * 0.5;
  float coverage = 1.0 - smoothstep(drawnHalfWidth - edge, drawnHalfWidth + edge, abs(offset));
  return coverage * halfWidth / drawnHalfWidth;
}

float wave(float waveDistance, vec2 surfacePoint, float cycle, float layer, float pixelWidth) {
  float progress = fract(cycle);
  float crest = mix(WAVE_REACH, WAVE_INSET, progress);
  if (abs(waveDistance - crest) > WAVE_WIDTH + pixelWidth) return 0.0;

  float fade = smoothstep(0.0, 0.2, progress) * (1.0 - smoothstep(0.9, 1.0, progress));
  float growth = smoothstep(0.0, 0.85, progress);
  float cut = mix(WAVE_DASH_SHORT, WAVE_DASH_LONG, growth);
  float dash = noise(surfacePoint * WAVE_DASH_GRAIN + vec2(mod(floor(cycle), 61.0) * 17.3, layer * 41.7));
  float taper = smoothstep(cut, cut + WAVE_DASH_TAPER, dash);
  float halfWidth = WAVE_WIDTH * taper * (0.4 + 0.6 * growth);

  return stroke(waveDistance - crest, halfWidth, pixelWidth) * fade;
}

float surge(float arrivals) {
  float settle = fract(arrivals);
  return max(
    1.0 - smoothstep(0.0, FOAM_RECEDE_SHARE, settle),
    smoothstep(FOAM_RECEDE_SHARE, 1.0, settle)
  );
}

void main() {
  vec2 distances = texture2D(uField, vFieldUv).rg * uIslandScale;
  float shoreDistance = distances.r;
  float waveDistance = distances.g;
  float pixelWidth = fwidth(waveDistance);
  if (shoreDistance < -FOAM_TUCK || min(shoreDistance, waveDistance) > WAVE_REACH + WAVE_WIDTH) discard;

  vec2 surfacePoint = vFieldUv * uFieldSize;
  float clock = uTime * WAVE_SPEED + noise(surfacePoint * WAVE_LAG_GRAIN) * WAVE_LAG;

  float foamWidth = mix(FOAM_CONTRACTED_WIDTH, FOAM_EXPANDED_WIDTH, surge(clock * WAVE_LAYERS));
  float foamEdge = foamWidth - foamJag(surfacePoint * FOAM_GRAIN, uTime) * FOAM_JAG;
  float foam = shoreDistance < foamEdge ? FOAM_OPACITY : 0.0;

  float waves = 0.0;
  for (float layer = 0.0; layer < WAVE_LAYERS; layer++) {
    waves = max(waves, wave(waveDistance, surfacePoint, clock + layer / WAVE_LAYERS, layer, pixelWidth));
  }

  float alpha = max(foam, waves * WAVE_STRENGTH);
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(uColor, alpha);
}

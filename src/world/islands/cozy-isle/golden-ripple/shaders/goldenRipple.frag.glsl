#include "/shaders/noise.glsl"
#include "/shaders/underwaterLight.glsl"

uniform sampler2D uField;
uniform float uSeconds;
uniform float uPresence;
uniform vec3  uColor;
uniform vec3  uCrestColor;

varying vec2 vFieldUv;
varying vec2 vWorldPoint;

vec2 ripple(float shoreGap, float pixelWidth, float age) {
  float progress = age / SECONDS;
  if (progress >= 1.0) return vec2(0.0);

  float front  = mix(START, REACH, 1.0 - pow(1.0 - progress, EASE));
  float spread = mix(1.0, SPREAD, progress);
  float offset = (shoreGap - front) / max(WIDTH * spread, pixelWidth);
  float crest  = exp(-offset * offset);
  float behind = front - shoreGap;
  float trail  = behind > 0.0 ? exp(-behind / (TRAIL_LENGTH * spread)) * TRAIL_STRENGTH : 0.0;
  float fade   = smoothstep(0.0, FADE_IN, progress) * (1.0 - smoothstep(FADE_OUT_FROM, 1.0, progress));
  return vec2(crest, trail) * fade;
}

void main() {
  float shoreGap   = texture2D(uField, vFieldUv).r;
  float pixelWidth = fwidth(shoreGap);
  if (shoreGap <= 0.0) discard;
  if (shoreGap - 0.5 * REFRACTION > REACH + 3.0 * max(WIDTH * SPREAD, pixelWidth)) discard;

  vec2  sway         = underwaterSway(uSeconds);
  float refractedGap = shoreGap + refractionAt(vWorldPoint, sway) * REFRACTION;

  float newest = floor(uSeconds / INTERVAL);
  vec2 glow = vec2(0.0);
  for (int i = 0; i < RIPPLES_ALIVE; i++) {
    float launch = (newest - float(i)) * INTERVAL;
    if (launch < 0.0) break;
    glow += ripple(refractedGap, pixelWidth, uSeconds - launch);
  }

  float strength = min(glow.x + glow.y, 1.0) * uPresence * STRENGTH;
  if (strength <= 0.003) discard;

  float shimmer = mix(1.0 - SHIMMER_DEPTH, 1.0, shimmerAt(vWorldPoint, sway));
  float alpha = strength * shimmer;
  if (alpha <= 0.003) discard;

  float crest = min(glow.x, 1.0);
  gl_FragColor = vec4(mix(uColor, uCrestColor, crest * crest), alpha);
}

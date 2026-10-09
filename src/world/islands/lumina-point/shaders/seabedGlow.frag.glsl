#include "/shaders/noise.glsl"
#include "/shaders/underwaterLight.glsl"

uniform sampler2D uField;
uniform float uGlow;
uniform float uTime;
uniform vec3 uColor;

varying vec2 vFieldUv;
varying vec2 vWorldPoint;

void main() {
  float shoreGap = texture2D(uField, vFieldUv).r;
  vec2 sway = underwaterSway(uTime);

  float outward = exp(-max(shoreGap, 0.0) / GLOW_REACH);
  float inward = exp(-max(-shoreGap, 0.0) / GLOW_INSET);
  float border = smoothstep(GLOW_MARGIN, GLOW_MARGIN * 0.7, shoreGap);
  float pulse = 1.0 - PULSE_DEPTH * (0.5 + 0.5 * sin(uTime * PULSE_RATE));
  float halo = outward * inward * border * pulse * GLOW_STRENGTH;

  float refraction = refractionAt(vWorldPoint, sway) * OUTLINE_REFRACTION;
  float outlineOffset = (shoreGap + refraction - OUTLINE_GAP) / OUTLINE_WIDTH;
  float outline = exp(-outlineOffset * outlineOffset) * OUTLINE_STRENGTH;

  float shimmer = 0.7 + 0.3 * shimmerAt(vWorldPoint, sway);
  float alpha = max(halo, outline) * shimmer * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

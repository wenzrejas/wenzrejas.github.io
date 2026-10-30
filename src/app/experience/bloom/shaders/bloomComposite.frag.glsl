uniform sampler2D uSource;
uniform float uStrength;

varying vec2 vUv;

float softenGlow(float peak) {
  float excess = max(peak - GLOW_KNEE, 0.0);
  return min(peak, GLOW_KNEE) + GLOW_HEADROOM * (1.0 - exp(-excess / GLOW_HEADROOM));
}

void main() {
  vec3 glow = texture2D(uSource, vUv).rgb * uStrength;
  float peak = max(glow.r, max(glow.g, glow.b));
  if (peak < FAINTEST_GLOW) discard;
  gl_FragColor = vec4(glow * softenGlow(peak) / peak, 0.0);
}

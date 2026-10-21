uniform vec3  uColor;
uniform float uPresence;
uniform float uClock;
uniform float uPeriod;
uniform float uWidth;
uniform float uTrail;
uniform float uRings;
uniform float uRepeat;

varying vec2 vUv;

void main() {
  float reach = length(vUv - 0.5) * 2.0;
  float alpha = 0.0;
  for (int i = 0; i < 3; i++) {
    float launch = float(i) * uPeriod / uRings;
    if (float(i) >= uRings || uClock < launch) continue;
    float progress = (uClock - launch) / uPeriod;
    float age = uRepeat > 0.5 ? fract(progress) : progress;
    if (age >= 1.0) continue;

#ifdef GLOW_SPREAD
    float crest = exp(-pow((reach - age) / (uWidth * GLOW_SPREAD), 2.0)) * GLOW_STRENGTH;
#else
    float crest = 1.0 - smoothstep(0.0, uWidth, abs(reach - age));
#endif
    float trail = smoothstep(age - uTrail, age, reach) * step(reach, age) * TRAIL_STRENGTH;
    alpha = max(alpha, max(crest, trail) * (1.0 - age) * (1.0 - age));
  }

  alpha *= uPresence;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

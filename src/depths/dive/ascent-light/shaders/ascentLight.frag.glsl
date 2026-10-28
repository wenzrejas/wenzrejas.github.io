uniform float uRise;
uniform float uFade;
uniform float uTime;
uniform float uAspect;
uniform float uFlashStrength;
uniform vec3 uDeep;
uniform vec3 uLight;

varying vec2 vUv;

float shaftsAt(float across) {
  float wide = 0.5 + 0.5 * sin(across * SHAFT_FREQUENCY + uTime * SHAFT_DRIFT);
  float narrow = 0.5 + 0.5 * sin(across * SHAFT_FREQUENCY * 2.7 - uTime * SHAFT_DRIFT * 1.6 + 1.3);
  return pow(wide * narrow, SHAFT_SHARPNESS);
}

void main() {
  float across = vUv.x * uAspect;
  float wave = (sin(across * WAVE_FREQUENCY + uTime * WAVE_RATE)
    + 0.5 * sin(across * WAVE_FREQUENCY * 2.3 - uTime * WAVE_RATE * 1.4)) * WAVE_HEIGHT;
  float reach = FEATHER + WAVE_HEIGHT * 1.5;
  float front = mix(1.0 + reach, -reach, uRise);
  float lit = smoothstep(front - FEATHER, front + FEATHER, vUv.y + wave);

  float fromCentre = length((vUv - 0.5) * vec2(uAspect, 1.0));
  float ripple = 0.5 + 0.5 * sin(fromCentre * RIPPLE_FREQUENCY - uTime * RIPPLE_RATE);
  float wash = uFade * (1.0 - RIPPLE_DEPTH * ripple * (1.0 - uFade));

  float height = clamp(vUv.y, 0.0, 1.0);
  vec3 water = mix(uDeep, uLight, height * height) + uLight * shaftsAt(across) * SHAFT_GLOW * height;
  float flash = max(smoothstep(FLASH_FROM, 1.0, uRise), uFade) * uFlashStrength;

  float alpha = max(lit, wash);
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(min(mix(water, uLight, flash), vec3(1.0)), alpha);
}

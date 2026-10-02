uniform vec3 uColor;
uniform vec3 uOutlineColor;
uniform float uHover;
uniform float uPulse;

varying vec2 vLocal;

float diamond(float tip) {
  return abs(vLocal.x) + abs(vLocal.y) - tip;
}

float coverage(float distance) {
  float edge = fwidth(distance);
  return 1.0 - smoothstep(-edge, edge, distance);
}

void main() {
  float ringShow = clamp(uHover, 0.0, 1.0);
  float idle = 1.0 - ringShow;
  float fading = 1.0 - uPulse;

  float coreTip = mix(IDLE_CORE, HOVER_CORE, uHover) * (1.0 + PULSE_SWELL * fading * fading * fading * idle);
  float core = diamond(coreTip);

  float ringScale = mix(RING_START, 1.0, uHover);
  float ringOuter = diamond(RING_OUTER * ringScale);
  float ring = max(ringOuter, -(ringOuter + RING_WIDTH * ringScale));
  ring = max(ring, GAP - abs(vLocal.x - vLocal.y));

  float ripple = abs(diamond(mix(coreTip, PULSE_REACH, 1.0 - fading * fading))) - PULSE_WIDTH * 0.5;
  float rippleShow = fading * fading * PULSE_OPACITY * idle;

  float fill = max(max(coverage(core), coverage(ring) * ringShow), coverage(ripple) * rippleShow);
  float outline = max(
    max(coverage(core - OUTLINE), coverage(ring - OUTLINE) * ringShow),
    coverage(ripple - OUTLINE) * rippleShow
  );
  float alpha = max(fill, outline * OUTLINE_OPACITY);
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uOutlineColor, uColor, fill), alpha);
}

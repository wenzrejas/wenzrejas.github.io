uniform float uProgress;
uniform float uOpacity;

varying float vRatio;
varying float vActive;

void main() {
  float endFade = smoothstep(0.0, 0.07, vRatio) * smoothstep(1.0, 0.93, vRatio);

  float remapped = uProgress * 3.0 - 1.0;
  float dist  = abs(vRatio - remapped);
  float pulse = exp(-dist * dist * 18.0);
  float trail = max(0.0, 1.0 - max(0.0, remapped - vRatio) * 4.0) * 0.25
                * step(vRatio, remapped);

  float alpha = (pulse + trail) * endFade * uOpacity;
  if (alpha < 0.005) discard;

  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}

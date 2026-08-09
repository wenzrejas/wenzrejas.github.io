uniform float uIntensity;
uniform vec3  uColor;

varying float vV;
varying float vU;
varying float vDistFade;

void main() {
  if (uIntensity < 0.01) discard;

  // Lift dark nighttime colors to a visible but subtle level
  float lum  = dot(uColor, vec3(0.299, 0.587, 0.114));
  vec3  base = uColor * max(1.0, 0.14 / max(lum, 0.001));

  // Tip slightly lighter than tail
  vec3 color = mix(min(base * 1.2, vec3(1.0)), base, vV);

  float fade  = 1.0 - smoothstep(0.0, 1.0, vV * vV);

  float across    = vU * 2.0;
  float widthBlur = exp(-across * across * 2.8);

  float alpha = fade * vDistFade * uIntensity * 0.30 * widthBlur;

  if (alpha < 0.005) discard;
  gl_FragColor = vec4(color, alpha);
}

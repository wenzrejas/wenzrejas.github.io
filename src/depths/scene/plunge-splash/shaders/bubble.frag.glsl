uniform vec3 uColor;

varying float vAlpha;

void main() {
  float radius = length(gl_PointCoord - 0.5) * 2.0;
  if (radius > 1.0) discard;

  float rim = smoothstep(0.55, 0.85, radius) * (1.0 - smoothstep(0.85, 1.0, radius));
  float core = 1.0 - smoothstep(0.0, 0.75, radius);
  float alpha = (rim * 0.8 + core * 0.55) * vAlpha;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

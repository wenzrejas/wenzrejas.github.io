varying float vAlpha;

void main() {
  if (vAlpha < 0.005) discard;

  // Gaussian soft glow — bright core, smooth falloff to edge
  vec2  c    = gl_PointCoord - 0.5;
  float d    = length(c) * 2.0;        // 0 at centre, 1 at corner
  float glow = exp(-d * d * 5.5);

  float alpha = glow * vAlpha;
  if (alpha < 0.005) discard;

  // Silver-blue moonlit tint
  gl_FragColor = vec4(0.88, 0.95, 1.0, alpha);
}

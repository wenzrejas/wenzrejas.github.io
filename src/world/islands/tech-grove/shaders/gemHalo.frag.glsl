uniform float uGlow;

varying vec3 vColor;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5) * 2.0;
  float glow = 1.0 - smoothstep(0.0, 1.0, fromCenter);
  float alpha = glow * glow * HALO_STRENGTH * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(vColor, alpha);
}

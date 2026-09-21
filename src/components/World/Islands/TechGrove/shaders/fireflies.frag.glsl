uniform vec3 uColor;

varying float vGlow;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float halo = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.18, 0.0, d);
  float alpha = (halo * halo * 0.6 + core) * vGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

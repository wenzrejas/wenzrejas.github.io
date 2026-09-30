varying float vAlpha;
varying vec3 vColor;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float halo = smoothstep(0.5, 0.0, fromCenter);
  float core = smoothstep(0.2, 0.0, fromCenter);
  float alpha = (halo * halo * 0.6 + core) * vAlpha;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.5), alpha);
}

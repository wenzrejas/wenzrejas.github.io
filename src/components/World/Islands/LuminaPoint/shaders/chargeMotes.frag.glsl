uniform vec3 uColor;

varying float vAlpha;

void main() {
  float fromCenter = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, fromCenter) * vAlpha;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), smoothstep(0.25, 0.0, fromCenter)), alpha);
}

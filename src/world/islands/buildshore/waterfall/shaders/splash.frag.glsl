uniform vec3 uFoamColor;

void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  gl_FragColor = vec4(uFoamColor, 1.0);
}

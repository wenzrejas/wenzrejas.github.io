uniform vec3  uColor;
uniform float uLevel;
uniform float uSweep;

varying vec2 vUv;

void main() {
  vec2  point = vUv - 0.5;
  float mask  = 1.0 - smoothstep(0.7, 1.0, length(point) * 2.0);
  vec2  cell  = abs(fract(point * CELLS) - 0.5);
  float line  = 1.0 - smoothstep(0.0, LINE_WIDTH, min(0.5 - cell.x, 0.5 - cell.y));
  float sweep = exp(-pow(point.x - point.y - uSweep, 2.0) * SWEEP_SHARPNESS);
  float alpha = line * mask * mix(BASE_ALPHA, 1.0, sweep) * uLevel;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor, alpha);
}

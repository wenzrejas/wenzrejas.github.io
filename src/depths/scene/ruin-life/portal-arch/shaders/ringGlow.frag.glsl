uniform vec3 uColor;
uniform float uStrength;

varying vec2 vUv;

void main() {
  float radius = length(vUv * 2.0 - 1.0) * REACH;
  float band = exp(-pow((radius - 1.0) / WIDTH, 2.0));
  float fill = (1.0 - smoothstep(0.0, 1.0, radius)) * 0.25;
  float edge = 1.0 - smoothstep(REACH * 0.85, REACH, radius);
  float alpha = uStrength * (band + fill) * edge;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

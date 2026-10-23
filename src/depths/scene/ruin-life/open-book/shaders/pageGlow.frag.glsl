uniform vec3 uColor;
uniform float uStrength;

varying vec2 vUv;

void main() {
  vec2 offset = vUv * 2.0;
  float alpha = exp(-dot(offset, offset) * 2.2) * uStrength;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

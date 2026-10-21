uniform sampler2D uLabel;
uniform vec2      uHalfSize;
uniform float     uLevel;

varying vec2 vPixel;

void main() {
  vec4 label = texture2D(uLabel, vPixel / uHalfSize * 0.5 + 0.5);
  float alpha = label.a * uLevel;
  if (alpha <= 0.01) discard;
  gl_FragColor = vec4(label.rgb, alpha);
}

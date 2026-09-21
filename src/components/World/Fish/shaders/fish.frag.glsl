uniform vec3  uColor;
uniform float uOpacity;

varying float vFade;

void main() {
  gl_FragColor = vec4(uColor, uOpacity * vFade);
}

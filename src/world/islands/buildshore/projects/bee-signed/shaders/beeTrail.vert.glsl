uniform float uSize;

attribute float aFade;

varying float vBrightness;

void main() {
  vBrightness  = aFade;
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * (0.4 + 0.6 * aFade);
}

uniform vec2 uViewport;
uniform vec2 uHalfSize;
uniform vec2 uOffset;

varying vec2 vPixel;

void main() {
  vec4 anchor = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vPixel = position.xy * uHalfSize;
  anchor.xy += (uOffset + vPixel) / uViewport * 2.0 * anchor.w;
  gl_Position = anchor;
}

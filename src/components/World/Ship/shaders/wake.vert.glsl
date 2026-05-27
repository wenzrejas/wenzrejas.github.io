varying vec2 vUv;
varying vec2 vWorldPos;
void main() {
  vUv       = uv;
  vWorldPos = position.xz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

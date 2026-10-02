varying vec2 vFieldUv;

void main() {
  vFieldUv = position.xz + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

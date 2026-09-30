varying float vHeight;

void main() {
  vHeight = uv.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

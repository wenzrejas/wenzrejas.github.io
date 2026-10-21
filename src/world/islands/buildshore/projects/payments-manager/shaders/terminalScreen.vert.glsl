varying vec2 vScreen;

void main() {
  vScreen = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

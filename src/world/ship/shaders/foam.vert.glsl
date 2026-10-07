varying vec2 vUv;
varying vec2 vHullPoint;

void main() {
  vUv = uv;
  vHullPoint = position.xz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

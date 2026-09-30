attribute vec2 aHaloUv;
attribute vec3 aColor;

varying vec2 vHaloUv;
varying vec3 vColor;

void main() {
  vHaloUv = aHaloUv;
  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

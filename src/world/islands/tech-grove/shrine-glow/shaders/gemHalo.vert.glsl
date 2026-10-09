uniform float uPixelsPerUnit;

attribute float aRadius;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aRadius * HALO_SPREAD * 2.0 * uPixelsPerUnit;
}

uniform float uLength;

varying float vFacing;
varying float vHeight;

void main() {
  vFacing = abs(normalize(normalMatrix * normal).z);
  vHeight = position.y * uLength;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

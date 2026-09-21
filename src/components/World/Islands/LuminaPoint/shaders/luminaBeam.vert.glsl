varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  vLocal  = position;
  vFacing = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

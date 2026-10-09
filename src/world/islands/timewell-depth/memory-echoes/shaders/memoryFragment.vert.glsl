varying vec3 vNormal;
varying float vHeight;

void main() {
  vHeight = position.y;
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}

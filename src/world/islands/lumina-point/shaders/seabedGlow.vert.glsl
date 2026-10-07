varying vec2 vFieldUv;
varying vec2 vWorldPoint;

void main() {
  vFieldUv = position.xz + 0.5;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPoint = world.xz;
  gl_Position = projectionMatrix * viewMatrix * world;
}

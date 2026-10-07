attribute float along;
attribute float across;

varying float vAlong;
varying float vAcross;
varying vec2 vWorldPoint;

void main() {
  vAlong = along;
  vAcross = across;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPoint = world.xz;
  gl_Position = projectionMatrix * viewMatrix * world;
}

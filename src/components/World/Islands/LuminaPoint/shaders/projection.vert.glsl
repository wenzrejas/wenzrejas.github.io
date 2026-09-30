attribute vec3 aColor;

varying vec3  vColor;
varying float vHeight;
varying float vFacing;
varying float vWorldY;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);

  vColor  = aColor;
  vHeight = uv.y;
  vFacing = abs(normalize(normalMatrix * normal).z);
  vWorldY = world.y;

  gl_Position = projectionMatrix * viewMatrix * world;
}

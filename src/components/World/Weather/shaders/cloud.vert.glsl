varying vec2 vWorldPos;
varying vec2 vLocalPos; // local plane coords: -1600..1600 in each axis

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xz;
  vLocalPos = position.xy;  // local space — safe for edge fade even when plane moves
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

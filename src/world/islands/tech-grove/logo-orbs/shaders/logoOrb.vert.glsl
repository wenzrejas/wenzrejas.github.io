varying vec2 vPoint;

void main() {
  vPoint = position.xy * 2.0;
  vec4 center = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xy += position.xy * length(modelMatrix[0].xyz);
  gl_Position = projectionMatrix * center;
}

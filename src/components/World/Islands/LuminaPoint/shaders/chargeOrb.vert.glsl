uniform float uSize;

varying vec2 vOffset;

void main() {
  float scale = length(modelViewMatrix[0].xyz);
  vec4 viewPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  viewPosition.xy += position.xy * uSize * scale;

  vOffset = position.xy;
  gl_Position = projectionMatrix * viewPosition;
}

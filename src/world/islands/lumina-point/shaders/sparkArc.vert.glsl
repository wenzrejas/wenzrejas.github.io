uniform float uHalfWidth;

attribute vec3 aDirection;
attribute float aSide;
attribute float aBrightness;

varying float vSide;
varying float vBrightness;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vec2 along = (modelViewMatrix * vec4(aDirection, 0.0)).xy;
  float span = length(along);
  vec2 across = span > 1e-6 ? vec2(-along.y, along.x) / span : vec2(0.0, 1.0);
  viewPosition.xy += across * aSide * uHalfWidth;

  vSide = aSide;
  vBrightness = aBrightness;
  gl_Position = projectionMatrix * viewPosition;
}

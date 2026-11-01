attribute float ratio;
attribute float side;

uniform float uProgress;
uniform float uThickness;

varying float vRatio;
varying float vActive;

void main() {
  vRatio = ratio;

  float remapped  = uProgress * 3.0 - 1.0;
  float baseTaper = smoothstep(0.0, 1.0, 1.0 - abs(ratio - 0.5) * 2.0);
  float envelope  = smoothstep(0.0, 1.0, 1.0 - abs(ratio - remapped));
  float thickness = uThickness * baseTaper * envelope;

  vActive = envelope;

  vec3 localPos = position + vec3(0.0, 0.0, side * thickness);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(localPos, 1.0);
}

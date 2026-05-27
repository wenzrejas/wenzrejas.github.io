attribute float aLifetime;
attribute float aMaxLifetime;
attribute float aSize;

uniform float uIntensity;

varying float vAlpha;

void main() {
  float t = clamp(aLifetime / aMaxLifetime, 0.0, 1.0);
  // Smooth fade-in / fade-out using a sine curve over [0, PI]
  vAlpha = sin(t * 3.14159265) * uIntensity;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize;
}

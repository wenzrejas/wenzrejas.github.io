uniform float uPixelsPerUnit;
uniform float uRise;

varying float vBrightness;

void main() {
  vBrightness = uRise;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = SIZE * uPixelsPerUnit * uRise;
}

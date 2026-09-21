attribute float aFade;
attribute float aPhase;

varying float vFade;

void main() {
  vec3 p = position;
  float bend = 0.5 - p.z;
  p.x += sin(aPhase - bend * 3.0) * 0.1 * bend * bend;

  vFade = aFade;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
}

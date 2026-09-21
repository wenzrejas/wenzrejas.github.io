uniform vec3  uColor;
uniform float uIntensity;

varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  float t = clamp(vLocal.x, 0.0, 1.0);

  float along = smoothstep(0.0, 0.02, t) * pow(1.0 - t, 1.3);
  float face  = pow(abs(normalize(vFacing).z), 1.4);

  float a = along * mix(0.12, 1.0, face) * uIntensity;
  if (a <= 0.002) discard;

  gl_FragColor = vec4(uColor, a);
}

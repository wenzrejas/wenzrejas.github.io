uniform vec3  uColor;
uniform float uIntensity;

varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  float along = clamp(vLocal.x, 0.0, 1.0);
  float reach = smoothstep(0.0, 0.04, along) * pow(1.0 - along, 1.6);
  float face  = pow(abs(normalize(vFacing).z), 1.4);

  float alpha = reach * mix(0.15, 1.0, face) * uIntensity;
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(uColor, alpha);
}

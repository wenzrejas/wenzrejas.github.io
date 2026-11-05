uniform vec3  uColor;
uniform float uIntensity;

varying vec3 vLocal;
varying vec3 vFacing;

void main() {
  float along = clamp(vLocal.x, 0.0, 1.0);
  float reach = smoothstep(0.0, BEAM_FADE_IN, along) * pow(1.0 - along, BEAM_FALLOFF);
  float face  = pow(abs(normalize(vFacing).z), 1.4);

  float alpha = reach * mix(BEAM_EDGE_LEVEL, 1.0, face) * uIntensity;
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(uColor, alpha);
}

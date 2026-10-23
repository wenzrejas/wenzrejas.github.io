uniform vec3 uTint;
uniform vec3 uEdgeTint;

varying float vAlpha;
varying float vSquash;
varying float vSoftness;

float spotGlow(vec2 point, vec2 centre, float radius) {
  return 1.0 - smoothstep(0.0, radius, length(point - centre));
}

void main() {
  vec2 point = (gl_PointCoord - 0.5) * vec2(2.0, -2.0);
  point *= vec2(1.0 + vSquash, 1.0 - vSquash * 0.7);
  float fromCentre = length(point);
  if (fromCentre > 1.0) discard;

  float rim = smoothstep(1.0 - vSoftness * 2.0, 1.0 - vSoftness * 0.5, fromCentre)
    * (1.0 - smoothstep(1.0 - vSoftness * 0.5, 1.0, fromCentre));
  float edge = smoothstep(0.86, 0.95, fromCentre) * (1.0 - smoothstep(0.95, 1.0, fromCentre));
  float body = (1.0 - fromCentre) * 0.12;
  float glint = spotGlow(point, vec2(-0.38, 0.42), 0.3);
  float underGlint = spotGlow(point, vec2(0.3, -0.45), 0.22) * 0.4;

  vec3 color = mix(uTint, vec3(1.0), max(glint, rim * 0.6));
  color = mix(color, uEdgeTint, edge * 0.6);
  float alpha = clamp(max(max(rim, glint), max(underGlint, edge * 0.8)) + body, 0.0, 1.0) * vAlpha;
  if (alpha <= 0.004) discard;
  gl_FragColor = vec4(color, alpha);
}

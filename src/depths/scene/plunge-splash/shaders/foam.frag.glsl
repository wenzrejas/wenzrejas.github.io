uniform vec3 uColor;
uniform vec3 uShadeColor;

varying float vAlpha;
varying float vSeed;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  float angle = atan(offset.y, offset.x + 1e-5);
  float edge = 0.42
             + 0.05 * sin(angle * 3.0 + vSeed * 6.2832)
             + 0.03 * sin(angle * 7.0 - vSeed * 9.0);
  float body = 1.0 - smoothstep(edge * 0.35, edge, length(offset));
  if (body <= 0.003) discard;

  float billow = 0.5
               + 0.25 * sin(offset.x * 9.0 + vSeed * 13.0) * sin(offset.y * 8.0 - vSeed * 7.0)
               + 0.25 * sin((offset.x + offset.y) * 11.0 + vSeed * 21.0);
  float light = clamp(0.55 + 0.45 * (1.0 - gl_PointCoord.y) + 0.25 * (billow - 0.5), 0.0, 1.0);
  float alpha = body * (0.45 + 0.55 * billow) * vAlpha;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uShadeColor, uColor, light), alpha);
}

uniform sampler2D uAtlas;

varying float vLife;
varying float vGlyph;
varying float vTilt;
varying float vLaunched;

void main() {
  if (vLaunched < 0.5) discard;

  vec2  offset = gl_PointCoord - 0.5;
  float c      = cos(vTilt);
  float s      = sin(vTilt);
  vec2  turned = vec2(c * offset.x - s * offset.y, s * offset.x + c * offset.y) + 0.5;
  if (any(lessThan(turned, vec2(0.0))) || any(greaterThan(turned, vec2(1.0)))) discard;

  vec2  uv    = vec2((vGlyph + turned.x) / GLYPH_COUNT, 1.0 - turned.y);
  float fade  = 1.0 - smoothstep(FADE_FROM, 1.0, vLife);
  vec4  glyph = texture2D(uAtlas, uv) * fade;
  if (glyph.a <= 0.003) discard;
  gl_FragColor = glyph;
}

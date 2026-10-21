uniform vec3  uColor;
uniform float uLevel;
uniform vec2  uBoxHalf;

varying vec2 vPixel;

float edgeOf(float distance) {
  return 1.0 - smoothstep(STROKE * 0.5 - 0.5, STROKE * 0.5 + 0.5, abs(distance));
}

void main() {
  vec2  beyond  = abs(vPixel) - uBoxHalf;
  float box     = length(max(beyond, 0.0)) + min(max(beyond.x, beyond.y), 0.0);
  float outline = edgeOf(box);
  float fill    = step(box, 0.0) * FILL_ALPHA;

  float handle = 0.0;
  float handleEdge = 0.0;
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      if (x == 0 && y == 0) continue;
      vec2  spot  = vec2(float(x), float(y)) * uBoxHalf;
      vec2  away  = abs(vPixel - spot) - HANDLE * 0.5;
      float square = max(away.x, away.y);
      handle     = max(handle, 1.0 - smoothstep(-0.5, 0.5, square));
      handleEdge = max(handleEdge, edgeOf(square));
    }
  }

  vec3  color = mix(uColor, vec3(1.0), handle * (1.0 - handleEdge));
  float alpha = max(max(outline, fill), handle) * uLevel;
  if (alpha <= 0.01) discard;
  gl_FragColor = vec4(color, alpha);
}

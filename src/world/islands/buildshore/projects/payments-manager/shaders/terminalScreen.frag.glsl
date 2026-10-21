uniform vec3  uIdleColor;
uniform vec3  uApprovedColor;
uniform vec3  uCheckColor;
uniform float uCheck;
uniform float uStroke;
uniform float uHalfHeight;

varying vec2 vScreen;

float strokeGap(vec2 point, vec2 from, vec2 to, float drawn) {
  vec2  span  = to - from;
  float reach = min(drawn, length(span));
  if (reach <= 0.0) return 1e3;
  vec2  along = normalize(span);
  float share = clamp(dot(point - from, along), 0.0, reach);
  return length(point - from - along * share);
}

void main() {
  vec2  point = vScreen / uHalfHeight;
  float disc  = 1.0 - smoothstep(uCheck * DISC_REACH - 0.02, uCheck * DISC_REACH, length(point));
  vec3  color = mix(uIdleColor, uApprovedColor, disc * step(0.001, uCheck));

  vec2  start  = vec2(-0.3, 0.0);
  vec2  corner = vec2(-0.08, -0.22);
  vec2  tip    = vec2(0.32, 0.22);
  float firstLength = length(corner - start);
  float drawn = uStroke * (firstLength + length(tip - corner));
  float gap = min(strokeGap(point, start, corner, drawn), strokeGap(point, corner, tip, drawn - firstLength));
  float stroke = 1.0 - smoothstep(STROKE_WIDTH - 0.02, STROKE_WIDTH, gap);

  gl_FragColor = vec4(mix(color, uCheckColor, stroke * step(0.001, uStroke) * uCheck), 1.0);
}

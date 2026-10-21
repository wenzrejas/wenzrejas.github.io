uniform float uTime;
uniform vec3  uBodyColor;
uniform vec3  uStripeColor;
uniform vec3  uWingColor;

varying float vFade;
varying float vFacing;
varying float vSeed;

float ellipse(vec2 point, vec2 centre, vec2 radii) {
  return 1.0 - smoothstep(0.82, 1.0, length((point - centre) / radii));
}

void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  point.y = -point.y;
  point.x *= vFacing;

  float flap  = 0.35 + 0.65 * abs(sin((uTime * FLAP_RATE + vSeed) * 3.14159265));
  float wings = max(
    ellipse(point, vec2(-0.12, 0.34), vec2(0.3, 0.42 * flap + 0.06)),
    ellipse(point, vec2(0.16, 0.3), vec2(0.26, 0.36 * flap + 0.06))
  );
  float body   = ellipse(point, vec2(-0.08, -0.16), vec2(0.58, 0.38));
  float head   = ellipse(point, vec2(0.56, -0.1), vec2(0.24, 0.24));
  float stripe = step(0.55, fract((point.x + 0.62) * 2.4)) * body;

  vec3  color = mix(uWingColor, uBodyColor, body);
  color = mix(color, uStripeColor, max(stripe, head));
  float alpha = max(max(body, head), wings * 0.7) * vFade;
  if (alpha <= 0.02) discard;
  gl_FragColor = vec4(color, alpha);
}

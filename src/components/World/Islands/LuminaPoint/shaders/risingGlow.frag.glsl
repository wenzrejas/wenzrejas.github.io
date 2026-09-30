uniform vec3  uColor;
uniform float uGlow;
uniform float uTime;

varying float vHeight;

void main() {
  float fade = pow(1.0 - vHeight, FALLOFF);
  float flow = 1.0 - FLOW_DEPTH * (0.5 + 0.5 * sin((vHeight * FLOW_DENSITY - uTime * FLOW_SPEED) * 6.2831853));

  float alpha = fade * flow * STRENGTH * uGlow;
  if (alpha <= 0.003) discard;

  gl_FragColor = vec4(uColor, alpha);
}

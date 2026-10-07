uniform vec3 uColor;
uniform float uGlow;

varying vec2 vUv;

void main() {
  float fromCenter = length(vUv * 2.0 - 1.0);
  float front = smoothstep(1.0, 1.0 - RING_EDGE, fromCenter);
  float wake = smoothstep(1.0 - RING_WAKE, 1.0, fromCenter);
  float alpha = front * wake * wake * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

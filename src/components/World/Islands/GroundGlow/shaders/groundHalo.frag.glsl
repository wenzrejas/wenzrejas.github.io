uniform float uGlow;

varying vec2 vHaloUv;
varying vec3 vColor;

void main() {
  float fromCenter = length(vHaloUv);
  float rim = 1.0 - smoothstep(0.0, HALO_SPREAD - 1.0, abs(fromCenter - 1.0));
  float fill = (1.0 - smoothstep(0.0, 1.0, fromCenter)) * HALO_FILL;
  float alpha = max(rim * rim, fill) * HALO_STRENGTH * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(vColor, alpha);
}

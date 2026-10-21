uniform vec3  uColor;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  float halfWidth = mix(NEAR_WIDTH, 1.0, vUv.x);
  float across    = 1.0 - smoothstep(0.0, 1.0, abs(vUv.y * 2.0 - 1.0) / halfWidth);
  float reach     = smoothstep(0.0, 0.12, vUv.x) * pow(1.0 - vUv.x, 1.5);

  float alpha = across * across * reach * uIntensity;
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(uColor, alpha);
}

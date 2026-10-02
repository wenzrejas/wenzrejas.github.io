uniform vec3 uColor;
uniform float uGlow;

varying float vSide;
varying float vBrightness;

void main() {
  float across = 1.0 - abs(vSide);
  float core = smoothstep(0.55, 1.0, across);
  float alpha = (across * across * 0.7 + core) * vBrightness * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), alpha);
}

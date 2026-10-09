varying vec2 vUv;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uFalloff;
uniform float uFadeStart;

void main() {
  vec2 position = (vUv - 0.5) * 2.0;
  float radius = dot(position, position);
  float glow = exp(-radius * uFalloff) * (1.0 - smoothstep(uFadeStart, 1.0, radius));
  gl_FragColor = vec4(uColor, glow * uOpacity);
}

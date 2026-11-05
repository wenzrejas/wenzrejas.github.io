uniform float uTime;
uniform float uIntensity;
uniform float uGlow;

varying vec2 vUv;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 point) {
  vec2 i = floor(point), fraction = fract(point);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), fraction.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), fraction.x),
    fraction.y
  );
}

float flicker(float seed, float time) {
  return vnoise(vec2(seed,         time *  2.4)) * 0.50
       + vnoise(vec2(seed *  3.7,  time *  7.9)) * 0.32
       + vnoise(vec2(seed * 11.3,  time * 18.5)) * 0.18;
}

float tongue(vec2 uv, float seed, float time) {
  float top = mix(0.6, 1.0, hash(vec2(seed, 7.0)))
            * (0.58 + 0.42 * flicker(seed * 9.0, time));
  if (uv.y > top) return 0.0;

  float rel  = uv.y / max(top, 1e-3);
  float sway = (flicker(seed * 17.0, time + rel * 0.35) - 0.5) * 0.46 * rel;
  float x    = uv.x - 0.5 - sway - (hash(vec2(seed, 3.0)) - 0.5) * 0.26;
  float w    = 0.25 * pow(1.0 - rel, 0.6);

  return (1.0 - smoothstep(0.0, w, abs(x))) * (1.0 - smoothstep(0.7, 1.0, rel));
}

void main() {
  float flame = 0.0;
  for (int i = 0; i < TONGUES; i++) {
    flame = max(flame, tongue(vUv, float(i) + 1.0, uTime));
  }

  vec2  coreUv    = (vUv - vec2(0.5, 0.10)) * vec2(1.0, 1.5);
  float core = 1.0 - smoothstep(0.10, 0.30, length(coreUv));

  vec2  glowUv    = (vUv - vec2(0.5, 0.22)) * vec2(1.0, 0.85);
  float glow = exp(-dot(glowUv, glowUv) * 11.0) * uGlow;

  float body = max(flame, core);
  if (body + glow <= 0.003) discard;

  vec3 color = mix(vec3(1.0, 0.95, 0.72), vec3(1.0, 0.62, 0.18), smoothstep(0.0, 0.4, vUv.y));
  color = mix(color, vec3(0.94, 0.26, 0.05), smoothstep(0.38, 0.9, vUv.y));
  color = mix(color, vec3(1.0, 0.99, 0.90), core * 0.75);

  gl_FragColor = vec4(color, (body + glow) * uIntensity);
}

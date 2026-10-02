uniform float uTime;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uFalloff;
uniform vec3 uColor;
varying vec2 vWorldXZ;

// sin-free hash — avoids GPU precision banding artifacts
float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  float dist = length(vWorldXZ - uCenter);

  float scale = 0.004;
  float n1 = fbm(vWorldXZ * scale + vec2(uTime * 0.012, uTime * 0.008));
  float n2 = fbm(vWorldXZ * scale * 1.6 + vec2(-uTime * 0.007, uTime * 0.014) + vec2(3.2, 1.7));
  float noiseVal = mix(n1, n2, 0.5);

  float edgeWarp = (noiseVal - 0.5) * uFalloff * 0.9;
  float warpedDist = dist + edgeWarp;

  float alpha = smoothstep(uRadius - uFalloff, uRadius, warpedDist);

  float wispMask = smoothstep(uRadius - uFalloff * 2.2, uRadius - uFalloff * 0.6, dist);
  float wisps = noiseVal * wispMask * 0.35;

  gl_FragColor = vec4(uColor, clamp(alpha + wisps, 0.0, 1.0));
}

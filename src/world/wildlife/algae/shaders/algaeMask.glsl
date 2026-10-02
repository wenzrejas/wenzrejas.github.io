uniform vec4  uAlgaePatches[ALGAE_MAX_PATCHES];
uniform vec3  uAlgaeGlow;
uniform float uAlgaeIntensity;
uniform float uAlgaeAmbient;

float algaeHash(vec2 p) {
  vec3 p3 = fract(vec3(mod(p.xyx, 4096.0)) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float algaeNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(algaeHash(i),                 algaeHash(i + vec2(1.0, 0.0)), f.x),
             mix(algaeHash(i + vec2(0.0, 1.0)), algaeHash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float algaeMask(vec2 p) {
  float coverage = 0.0;
  for (int i = 0; i < ALGAE_MAX_PATCHES; i++) {
    vec4 zone = uAlgaePatches[i];
    if (zone.w <= 0.0) continue;
    float edge = zone.z * (0.7 + 0.5 * algaeNoise(p * 0.025 + zone.xy * 0.01));
    float reach = 1.0 - smoothstep(edge * 0.55, edge, length(p - zone.xy));
    coverage = max(coverage, reach * zone.w);
  }
  return coverage * uAlgaeIntensity;
}

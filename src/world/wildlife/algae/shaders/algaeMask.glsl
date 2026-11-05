uniform vec4  uAlgaePatches[ALGAE_MAX_PATCHES];
uniform vec3  uAlgaeGlow;
uniform float uAlgaeIntensity;
uniform float uAlgaeAmbient;

float algaeHash(vec2 point) {
  vec3 scrambled = fract(vec3(mod(point.xyx, 4096.0)) * 0.1031);
  scrambled += dot(scrambled, scrambled.yzx + 33.33);
  return fract((scrambled.x + scrambled.y) * scrambled.z);
}

float algaeNoise(vec2 point) {
  vec2 i = floor(point), fraction = fract(point);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  return mix(mix(algaeHash(i),                 algaeHash(i + vec2(1.0, 0.0)), fraction.x),
             mix(algaeHash(i + vec2(0.0, 1.0)), algaeHash(i + vec2(1.0, 1.0)), fraction.x), fraction.y);
}

float algaeMask(vec2 point) {
  float coverage = 0.0;
  for (int i = 0; i < ALGAE_MAX_PATCHES; i++) {
    vec4 zone = uAlgaePatches[i];
    if (zone.w <= 0.0) continue;
    float edge = zone.z * (0.7 + 0.5 * algaeNoise(point * 0.025 + zone.xy * 0.01));
    float reach = 1.0 - smoothstep(edge * 0.55, edge, length(point - zone.xy));
    coverage = max(coverage, reach * zone.w);
  }
  return coverage * uAlgaeIntensity;
}

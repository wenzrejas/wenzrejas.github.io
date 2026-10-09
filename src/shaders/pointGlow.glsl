float softPointGlow(vec2 pointCoord) {
  float glow = 1.0 - smoothstep(0.0, 1.0, length(pointCoord - 0.5) * 2.0);
  return glow * glow;
}

float moteCore(float fromCenter, float coreRadius) {
  return 1.0 - smoothstep(0.0, coreRadius, fromCenter);
}

float moteGlow(float fromCenter, float core) {
  float halo = 1.0 - smoothstep(0.0, 0.5, fromCenter);
  return halo * halo * 0.6 + core;
}

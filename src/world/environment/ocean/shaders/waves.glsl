#include "./waveSines.glsl"

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p  = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

vec3 waveField(vec2 xz) {
  float t = uTime * uWaveSpeed;

  vec3 sines = waveSines(xz);
  float y = sines.x, dHdx = sines.y, dHdz = sines.z;

  float fac  = 0.06;
  vec2  foff = vec2(t * 0.08, t * 0.05);
  float eps  = 2.0;
  float noiseC = fbm(xz                      * fac + foff);
  float noiseX = fbm((xz + vec2(eps, 0.0))   * fac + foff);
  float noiseZ = fbm((xz + vec2(0.0, eps))   * fac + foff);
  y    += (noiseC - 0.5) * 0.6;
  dHdx += ((noiseX - noiseC) / eps) * 0.6;
  dHdz += ((noiseZ - noiseC) / eps) * 0.6;

  float ls_fac = 0.008, ls_amp = 0.9, ls_eps = 6.0;
  vec2  lsOff  = vec2(uTime * 0.016, uTime * 0.013);
  float lsC    = fbm(xz                       * ls_fac + lsOff);
  float lsX    = fbm((xz + vec2(ls_eps, 0.0)) * ls_fac + lsOff);
  float lsZ    = fbm((xz + vec2(0.0, ls_eps)) * ls_fac + lsOff);
  y    += (lsC - 0.5) * ls_amp;
  dHdx += ((lsX - lsC) / ls_eps) * ls_amp;
  dHdz += ((lsZ - lsC) / ls_eps) * ls_amp;

  return vec3(y, dHdx, dHdz);
}

uniform float uTime;
uniform float uWaveAmp;
uniform float uWaveSpeed;
uniform float uWindAmp; // smoothed multiplier driven by wind-wave alignment (0.5..1.3)

varying vec2 vWorldPos;
varying vec3 vPos;
varying vec3 vNormal;
varying float vWaveHeight;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
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

// Returns vec3(height, dH/dWorldX, dH/dWorldZ) for one sine-wave layer.
vec3 waveContrib(vec2 pos, vec2 dir, float freq, float amp, float phase, float spd) {
  vec2 d   = normalize(dir);
  float arg = dot(pos, d) * freq + uTime * spd + phase;
  float s = sin(arg), c = cos(arg);
  return vec3(amp * s, amp * c * freq * d.x, amp * c * freq * d.y);
}

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec2 xz = worldPos.xz;
  float t = uTime * uWaveSpeed;

  float y = 0.0, dHdx = 0.0, dHdz = 0.0;
  vec3 w;

  // Primary swells — fixed directions; amplitude scaled by uWindAmp from wind alignment.
  w = waveContrib(xz, vec2(-0.97,  0.26), 0.08, 0.40 * uWindAmp, 0.00, 1.2 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.87,  0.50), 0.13, 0.25 * uWindAmp, 1.57, 0.8 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.97,  0.00), 0.22, 0.12 * uWindAmp, 3.14, 1.5 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.50,  0.87), 0.35, 0.08 * uWindAmp, 0.78, 2.0 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.26, -0.97), 0.50, 0.04 * uWindAmp, 2.30, 2.8 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;

  // FBM overlay — medium-scale chop
  float fac  = 0.06;
  vec2  foff = vec2(t * 0.08, t * 0.05);
  float eps  = 2.0;
  float noiseC = fbm(xz                      * fac + foff);
  float noiseX = fbm((xz + vec2(eps, 0.0))   * fac + foff);
  float noiseZ = fbm((xz + vec2(0.0, eps))   * fac + foff);
  y    += (noiseC - 0.5) * 0.6;
  dHdx += ((noiseX - noiseC) / eps) * 0.6;
  dHdz += ((noiseZ - noiseC) / eps) * 0.6;

  // Large-scale swell — slow broad undulation that breaks sine-wave uniformity
  float ls_fac = 0.008, ls_amp = 0.9, ls_eps = 6.0;
  vec2  lsOff  = vec2(uTime * 0.016, uTime * 0.013);
  float lsC    = fbm(xz                       * ls_fac + lsOff);
  float lsX    = fbm((xz + vec2(ls_eps, 0.0)) * ls_fac + lsOff);
  float lsZ    = fbm((xz + vec2(0.0, ls_eps)) * ls_fac + lsOff);
  y    += (lsC - 0.5) * ls_amp;
  dHdx += ((lsX - lsC) / ls_eps) * ls_amp;
  dHdz += ((lsZ - lsC) / ls_eps) * ls_amp;

  vWaveHeight = y;
  worldPos.y += y * uWaveAmp;

  // World-space normal from the wave-height gradient
  vNormal   = normalize(vec3(-dHdx * uWaveAmp, 1.0, -dHdz * uWaveAmp));
  vWorldPos = worldPos.xz;
  vPos      = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

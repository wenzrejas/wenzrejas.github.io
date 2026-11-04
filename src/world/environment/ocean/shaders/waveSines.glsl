uniform float uTime;
uniform float uWaveAmp;
uniform float uWaveSpeed;
uniform float uWindAmp;
uniform sampler2D uShoreCalmMap;
uniform float uShoreCalmMapSize;

vec3 waveContrib(vec2 pos, vec2 dir, float freq, float amp, float phase, float spd) {
  vec2 d   = normalize(dir);
  float arg = dot(pos, d) * freq + uTime * spd + phase;
  float s = sin(arg), c = cos(arg);
  return vec3(amp * s, amp * c * freq * d.x, amp * c * freq * d.y);
}

vec3 waveSines(vec2 xz) {
  float y = 0.0, dHdx = 0.0, dHdz = 0.0;
  vec3 w;

  w = waveContrib(xz, vec2(-0.97,  0.26), 0.08, 0.40 * uWindAmp, 0.00, 1.2 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.87,  0.50), 0.13, 0.25 * uWindAmp, 1.57, 0.8 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.97,  0.00), 0.22, 0.12 * uWindAmp, 3.14, 1.5 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.50,  0.87), 0.35, 0.08 * uWindAmp, 0.78, 2.0 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;
  w = waveContrib(xz, vec2(-0.26, -0.97), 0.50, 0.04 * uWindAmp, 2.30, 2.8 * uWaveSpeed); y += w.x; dHdx += w.y; dHdz += w.z;

  return vec3(y, dHdx, dHdz);
}

float shoreCalm(vec2 xz) {
  return texture2D(uShoreCalmMap, xz / uShoreCalmMapSize + 0.5).r;
}

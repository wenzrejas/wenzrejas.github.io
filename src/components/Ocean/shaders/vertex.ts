export const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;

  varying vec2 vWorldPos;
  varying vec3 vPos;

  // ── Value noise (Perlin-like fBm) ──────────────────────────────────────────
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

  // ── Single sine-wave layer ─────────────────────────────────────────────────
  float sineWave(vec2 pos, vec2 dir, float freq, float amp, float phase, float spd) {
    return amp * sin(dot(pos, normalize(dir)) * freq + uTime * spd + phase);
  }

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec2 xz = worldPos.xz;
    float t = uTime * uWaveSpeed;

    // ── Layered sine waves ─────────────────────────────────────────────────
    float y = 0.0;
    y += sineWave(xz, vec2( 1.0,  0.7), 0.08, 0.40, 0.00, 1.2 * uWaveSpeed);
    y += sineWave(xz, vec2(-0.5,  1.0), 0.13, 0.25, 1.57, 0.8 * uWaveSpeed);
    y += sineWave(xz, vec2( 0.3, -0.8), 0.22, 0.12, 3.14, 1.5 * uWaveSpeed);
    y += sineWave(xz, vec2(-0.9,  0.2), 0.35, 0.08, 0.78, 2.0 * uWaveSpeed);
    y += sineWave(xz, vec2( 0.6,  0.5), 0.50, 0.04, 2.30, 2.8 * uWaveSpeed);

    // ── Perlin fBm noise overlay ───────────────────────────────────────────
    float noise = fbm(xz * 0.06 + vec2(t * 0.08, t * 0.05));
    y += (noise - 0.5) * 0.6;

    worldPos.y += y * uWaveAmp;
    vWorldPos   = worldPos.xz;
    vPos        = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

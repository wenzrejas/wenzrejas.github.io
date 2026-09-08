uniform sampler2D uProfile;
uniform float uScale;
uniform float uRotation;
uniform float uTime;
uniform vec3  uColor;
uniform float uWidth;
uniform float uRim;
uniform float uReach;
uniform float uInset;
uniform float uSpeed;
uniform float uSegments;
uniform float uDashMin;
uniform float uDashMax;
uniform float uStrength;
uniform float uWobble;

varying vec2 vLocal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

float band(float x, float width) {
  return 1.0 - smoothstep(width * 0.6, width, abs(x));
}

float lapAt(float ph, float d, float reach, float sFrac, float baseSpan, float bright, float width) {
  float ring = uInset + (reach - uInset) * (1.0 - ph);
  if (abs(d - ring) > width) return 0.0;

  float fade = smoothstep(0.0, 0.2, ph) * (1.0 - smoothstep(0.9, 1.0, ph));
  if (fade <= 0.0) return 0.0;

  float grow  = smoothstep(0.0, 0.85, ph);
  float span  = baseSpan * (0.3 + 0.7 * grow);
  float pos   = min(abs(sFrac - 0.5) / max(span, 1e-4), 1.0);
  float taper = smoothstep(0.0, 1.0, 1.0 - pos * pos);
  float w     = width * (0.12 + 0.88 * taper) * (0.4 + 0.6 * grow);

  return band(d - ring, w) * taper * fade * bright;
}

float arcAt(float s, float salt, float d) {
  float cell = floor(s);

  float hPhase  = hash(vec2(cell, cell * 0.618 + salt));
  float hLen    = hash(vec2(cell, cell * 0.371 + 3.7 + salt));
  float hBright = hash(vec2(cell, cell * 0.523 + 2.1 + salt));
  float hReach  = hash(vec2(cell, cell * 1.234 + 5.3 + salt));

  float ph     = fract(uTime * uSpeed * (0.75 + hLen * 0.5) + hPhase);
  float reach  = uReach * (0.55 + hReach * 0.45);
  float bright = 0.6 + hBright * 0.4;

  return lapAt(ph, d, reach, fract(s), mix(uDashMin, uDashMax, hLen), bright, uWidth);
}

void main() {
  vec2  w   = vec2(vLocal.x, -vLocal.y);
  float len = length(w);
  float ang = atan(w.y, w.x) + uRotation;
  float u   = fract(ang * 0.15915494 + 0.5);

  float shore  = texture2D(uProfile, vec2(u, 0.5)).r * uScale;
  float wobble = (vnoise(w * 0.06 + uTime * 0.05) - 0.5) * uWobble;
  float d      = len - shore + wobble;

  if (d > uReach + uWidth || d < -uWidth * 2.0) discard;

  float rim = band(d, uWidth) * uRim;

  float s = u * uSegments;
  float lap = max(
    max(arcAt(s, 0.0, d), arcAt(s + 0.3333, 17.3, d)),
    arcAt(s + 0.6667, 41.7, d)
  );

  float a = max(rim, lap) * uStrength;
  if (a <= 0.002) discard;

  gl_FragColor = vec4(uColor, a);
}

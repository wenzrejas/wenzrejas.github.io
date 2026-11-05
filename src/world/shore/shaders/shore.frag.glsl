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
uniform float uDashBias;
uniform float uStrength;
uniform float uWobble;

varying vec2 vLocal;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 point) {
  vec2 i = floor(point), fraction = fract(point);
  fraction = fraction * fraction * fraction * (fraction * (fraction * 6.0 - 15.0) + 10.0);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), fraction.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), fraction.x),
    fraction.y
  );
}

float band(float x, float width) {
  return 1.0 - smoothstep(width * 0.6, width, abs(x));
}

float lapAt(float phase, float shoreGap, float reach, float sFrac, float baseSpan, float bright, float width) {
  float ring = uInset + (reach - uInset) * (1.0 - phase);
  if (abs(shoreGap - ring) > width) return 0.0;

  float fade = smoothstep(0.0, 0.2, phase) * (1.0 - smoothstep(0.9, 1.0, phase));
  if (fade <= 0.0) return 0.0;

  float grow  = smoothstep(0.0, 0.85, phase);
  float span  = baseSpan * (0.3 + 0.7 * grow);
  float spanShare   = min(abs(sFrac - 0.5) / max(span, 1e-4), 1.0);
  float taper = smoothstep(0.0, 1.0, 1.0 - spanShare * spanShare);
  float taperedWidth = width * (0.12 + 0.88 * taper) * (0.4 + 0.6 * grow);

  return band(shoreGap - ring, taperedWidth) * taper * fade * bright;
}

float arcAt(float along, float salt, float shoreGap) {
  float cell = floor(along);

  float hPhase  = hash(vec2(cell, cell * 0.618 + salt));
  float hLen    = hash(vec2(cell, cell * 0.371 + 3.7 + salt));
  float hBright = hash(vec2(cell, cell * 0.523 + 2.1 + salt));
  float hReach  = hash(vec2(cell, cell * 1.234 + 5.3 + salt));

  float phase     = fract(uTime * uSpeed * (0.75 + hLen * 0.5) + hPhase);
  float reach  = uReach * (0.55 + hReach * 0.45);
  float bright = 0.6 + hBright * 0.4;

  float hSpan = pow(hLen, uDashBias);

  return lapAt(phase, shoreGap, reach, fract(along), mix(uDashMin, uDashMax, hSpan), bright, uWidth);
}

void main() {
  vec2  offset   = vec2(vLocal.x, -vLocal.y);
  float radius = length(offset);
  float angle = atan(offset.y, offset.x) + uRotation;
  float turn   = fract(angle * 0.15915494 + 0.5);

  float shore  = texture2D(uProfile, vec2(turn, 0.5)).r * uScale;
  float wobble = (vnoise(offset * 0.06 + uTime * 0.05) - 0.5) * uWobble;
  float shoreGap      = radius - shore + wobble;

  if (shoreGap > uReach + uWidth || shoreGap < -uWidth * 2.0) discard;

  float rim = band(shoreGap, uWidth) * uRim;

  float along = turn * uSegments;
  float lap = max(
    max(arcAt(along, 0.0, shoreGap), arcAt(along + 0.3333, 17.3, shoreGap)),
    arcAt(along + 0.6667, 41.7, shoreGap)
  );

  float alpha = max(rim, lap) * uStrength;
  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(uColor, alpha);
}

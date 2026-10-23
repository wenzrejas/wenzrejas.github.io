#include "/shaders/noise.glsl"

uniform sampler2D uDial;
uniform float uPresence;
uniform float uReveal;
uniform float uFlare;
uniform float uGrowth;
uniform float uDialTurn;
uniform float uGhostTurn;
uniform float uHourAngle;
uniform float uMinuteAngle;
uniform float uSecondsAngle;
uniform float uTime;
uniform float uAspect;
uniform vec3 uInk;
uniform vec3 uGlow;
uniform vec3 uCore;

varying vec2 vUv;

vec2 turned(vec2 point, float angle) {
  float c = cos(angle), s = sin(angle);
  return vec2(c * point.x - s * point.y, s * point.x + c * point.y);
}

float dialAt(vec2 point, float turn, float scale, float blur) {
  vec2 uv = turned(point, turn) / scale * 0.5 + 0.5;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 0.0;
  return texture2D(uDial, uv, blur).a;
}

float coverage(float distance, float pixel) {
  return 1.0 - smoothstep(-0.5 * pixel, 0.5 * pixel, distance);
}

vec2 handFrame(vec2 point, float angle) {
  vec2 along = vec2(sin(angle), cos(angle));
  return vec2(dot(point, along), point.x * along.y - point.y * along.x);
}

float capsuleDistance(vec2 frame, float from, float to, float halfWidth) {
  return length(vec2(frame.x - clamp(frame.x, from, to), frame.y)) - halfWidth;
}

float lanceDistance(vec2 frame, float reach, float halfWidth) {
  float bevel = reach * HAND_BEVEL_SHARE;
  float bevelHalfWidth = halfWidth * HAND_BEVEL_WIDTH_SHARE;
  float toBevel = mix(halfWidth, bevelHalfWidth, frame.x / bevel);
  float toTip = bevelHalfWidth * (reach - frame.x) / (reach - bevel);
  float blade = max(abs(frame.y) - min(toBevel, toTip), -frame.x);
  float tailHalfWidth = halfWidth * HAND_TAIL_WIDTH_SHARE;
  return min(blade, capsuleDistance(frame, tailHalfWidth - HAND_TAIL, 0.0, tailHalfWidth));
}

float glowAround(float distance, float body) {
  return (1.0 - body) * exp(-max(distance, 0.0) / HAND_GLOW_SPREAD);
}

vec2 lanceAt(vec2 point, float angle, float reach, float halfWidth, float pixel) {
  vec2 frame = handFrame(point, angle);
  float distance = lanceDistance(frame, reach, halfWidth);
  float body = coverage(distance, pixel);
  float groove = coverage(
    capsuleDistance(frame, HAND_GROOVE_FROM, reach * HAND_GROOVE_SHARE, HAND_GROOVE_HALF_WIDTH),
    pixel
  );
  return vec2(body * mix(1.0, HAND_GROOVE_LIGHT, groove), glowAround(distance, body));
}

vec2 needleAt(vec2 point, float angle, float pixel) {
  vec2 frame = handFrame(point, angle);
  float distance = capsuleDistance(frame, -SECONDS_HAND_TAIL, SECONDS_HAND_REACH, SECONDS_HAND_HALF_WIDTH);
  float body = coverage(distance, pixel);
  return vec2(body, glowAround(distance, body));
}

float sparkleAt(vec2 point) {
  vec2 space = point * SPARKLE_CELLS + vec2(0.0, -uTime * SPARKLE_DRIFT);
  vec2 cell = floor(space);
  if (hash(cell) < 1.0 - SPARKLE_SHARE) return 0.0;
  vec2 spot = vec2(hash(cell + 3.1), hash(cell + 7.7)) * 0.6 + 0.2;
  float size = SPARKLE_SIZE * (0.4 + 0.6 * hash(cell + 5.3));
  float twinkle = 0.5 + 0.5 * sin(uTime * SPARKLE_TWINKLE_RATE + hash(cell) * 40.0);
  float glow = 1.0 - smoothstep(0.0, size, length(fract(space) - spot));
  return glow * glow * twinkle;
}

void main() {
  vec2 point = (vUv - 0.5) * vec2(uAspect, 1.0) / (RADIUS * uGrowth);
  float pixel = fwidth(point.y);
  float fromCentre = length(point);
  float reveal = 1.0 - smoothstep(uReveal * REVEAL_REACH - REVEAL_FEATHER, uReveal * REVEAL_REACH, fromCentre);

  float dial = dialAt(point, uDialTurn, 1.0, 0.0);
  float halo = dialAt(point, uDialTurn, 1.0, HALO_BLUR) * GLOW;
  float ghost = dialAt(point, uGhostTurn, GHOST_SCALE, GHOST_BLUR) * GHOST_ALPHA;
  vec2 hour = lanceAt(point, uHourAngle, HOUR_HAND_REACH, HOUR_HAND_HALF_WIDTH, pixel);
  vec2 minute = lanceAt(point, uMinuteAngle, MINUTE_HAND_REACH, MINUTE_HAND_HALF_WIDTH, pixel);
  vec2 seconds = needleAt(point, uSecondsAngle, pixel);
  float hubDisc = coverage(fromCentre - HUB_RADIUS, pixel);
  float hubRim = hubDisc - coverage(fromCentre - HUB_RADIUS + HUB_RIM, pixel);
  float jewel = coverage(fromCentre - JEWEL_RADIUS, pixel);
  float hub = mix(hubDisc * HUB_FILL, 1.0, max(hubRim, jewel));
  float uncovered = 1.0 - hubDisc;
  float hands = (hour.x + minute.x + seconds.x) * uncovered + hub;
  float handGlow = (hour.y + minute.y + seconds.y) * uncovered * HAND_GLOW;
  float core = exp(-fromCentre * fromCentre / (CORE_SIZE * CORE_SIZE)) * CORE_GLOW;
  float sparkles = sparkleAt(point) * (1.0 - smoothstep(SPARKLE_FADE_FROM, SPARKLE_FADE_TO, fromCentre));

  float strength = uPresence * reveal * (1.0 + uFlare * FLARE);
  vec3 color = uInk * (dial + hands) + uGlow * (halo + ghost + sparkles + handGlow) + uCore * core;
  gl_FragColor = vec4(color * strength, 1.0);
}

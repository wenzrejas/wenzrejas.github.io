#include "/shaders/noise.glsl"
#include "/shaders/star.glsl"

uniform vec3 uColor;
uniform float uStrength;
uniform float uDirection;
uniform float uPhase;
uniform float uTime;
uniform float uReveal;
uniform float uGlow;

varying vec2 vUv;

float line(float offset, float width) {
  return 1.0 - smoothstep(0.0, width, abs(offset));
}

float sweep(float angle) {
  return pow(0.5 + 0.5 * cos(angle), SWEEP_SHARPNESS);
}

void main() {
  vec2 point = (vUv * 2.0 - 1.0) * REACH;
  float fromCenter = length(point);
  float angle = atan(point.y, point.x);
  float grow = mix(START_SCALE, 1.0, 1.0 - pow(1.0 - uReveal, 3.0));
  float innerRadius = INNER_RADIUS * grow;
  float outerRadius = OUTER_RADIUS * grow;
  float spin = uTime * SWEEP_RATE * uDirection + uPhase;

  float inner = line(fromCenter - innerRadius, LINE_WIDTH) * mix(LINE_FLOOR, 1.0, sweep(angle - spin));
  float halo = line(fromCenter - innerRadius, GLOW_WIDTH) * GLOW_STRENGTH;
  float outerSweep = sweep(angle + spin * COUNTER_SHARE);
  float outer = line(fromCenter - outerRadius, LINE_WIDTH) * mix(LINE_FLOOR, 1.0, outerSweep) * OUTER_STRENGTH;

  float drift = uTime * SPARKLE_DRIFT * uDirection + uPhase;
  float slot = floor(fract((angle - drift) / 6.2832) * SPARKLE_COUNT);
  float slotAngle = (slot + 0.5) / SPARKLE_COUNT * 6.2832 + drift;
  float seed = hash(slot * 12.9898);
  float twinkle = pow(0.5 + 0.5 * sin(uTime * SPARKLE_TWINKLE_RATE + seed * 6.2832), 4.0);
  vec2 sparkleAt = vec2(cos(slotAngle), sin(slotAngle)) * innerRadius;
  float sparkle = star((point - sparkleAt) / SPARKLE_SIZE) * twinkle;

  float light = (inner + halo + outer + sparkle) * uReveal * uGlow * uStrength * STRENGTH;
  if (light <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), min(inner + sparkle, 1.0) * CORE_WHITENESS), light);
}

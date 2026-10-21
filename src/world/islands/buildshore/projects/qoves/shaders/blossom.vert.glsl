uniform float uClock;
uniform float uPresence;
uniform float uSize;
uniform vec3  uCentre;
uniform vec2  uSpawnRadii;

attribute float aSeed;
attribute float aSpawnAngle;

varying float vFade;
varying float vSpin;
varying float vTumble;

#define TAU 6.28318530718

void main() {
  float age  = uClock - aSeed * LIFE_SECONDS;
  float life = fract(age / LIFE_SECONDS);

  float angle  = aSpawnAngle + SWIRL * life;
  float gather = mix(1.0, GATHER, life);
  vec3  point  = uCentre + vec3(
    cos(angle) * uSpawnRadii.x * gather,
    RISE * life,
    sin(angle) * uSpawnRadii.y * gather
  );
  point.x += sin((uClock * SWAY_RATE + aSeed) * TAU) * SWAY;
  point.z += cos((uClock * SWAY_RATE + aSeed * 1.7) * TAU) * SWAY;

  vFade   = step(0.0, age) * uPresence * smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.7, 1.0, life));
  vSpin   = (uClock * SPIN_RATE + aSeed) * TAU;
  vTumble = (uClock * TUMBLE_RATE + aSeed * 3.1) * TAU;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
  gl_PointSize = uSize * (0.8 + 0.4 * fract(aSeed * 7.31));
}

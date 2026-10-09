uniform float uReveal[ORBIT_COUNT];
uniform float uTime;
uniform float uPixelRatio;

attribute float aRadius;
attribute float aSlot;
attribute float aLift;
attribute float aDirection;
attribute float aPhase;
attribute float aOrbit;

varying float vBrightness;

void main() {
  float reveal = uReveal[int(aOrbit)];
  float spread = 1.0 - pow(1.0 - reveal, 3.0);
  float angle = aSlot + aDirection * uTime * REVOLVE_RATE;
  float reach = aRadius * spread * (1.0 + WANDER * sin(uTime * TWINKLE_RATE * 0.5 + aPhase));
  float rise = aLift + FLOAT_HEIGHT * sin(uTime * FLOAT_RATE + aPhase);
  vec3 point = position + vec3(cos(angle) * reach, rise, sin(angle) * reach);

  float twinkle = (0.55 + 0.45 * sin(uTime * TWINKLE_RATE + aPhase * 5.0)) * reveal;
  vBrightness = twinkle;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
  gl_PointSize = PIXELS * uPixelRatio * (0.6 + 0.4 * twinkle);
}

#include "/shaders/noise.glsl"

uniform vec3  uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uLevel;

varying vec3  vViewNormal;
varying float vWorldY;
varying float vSeed;

void main() {
  float scan = 1.0 - SCAN_DEPTH * (0.5 + 0.5 * sin((vWorldY * SCAN_DENSITY - uTime * SCAN_SPEED) * 6.2831853));
  float rim  = pow(1.0 - abs(normalize(vViewNormal).z), RIM_POWER);

  float tick    = floor(uTime * FLICKER_RATE);
  float flicker = 1.0 - FLICKER_DEPTH * step(1.0 - FLICKER_CHANCE, hash(tick + vSeed * 97.0));

  float alpha = clamp(uOpacity + rim * RIM_GAIN, 0.0, 1.0) * scan * flicker * uLevel;
  if (alpha <= 0.003) discard;

  gl_FragColor = vec4(uColor * (1.0 + rim * RIM_GAIN), alpha);
}

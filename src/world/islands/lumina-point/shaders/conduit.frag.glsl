#include "/shaders/noise.glsl"
#include "/shaders/underwaterLight.glsl"

uniform float uFront;
uniform float uGlow;
uniform float uTime;
uniform vec3 uColor;

varying float vAlong;
varying float vAcross;
varying vec2 vWorldPoint;

void main() {
  vec2 sway = underwaterSway(uTime);
  float across = vAcross + refractionAt(vWorldPoint, sway) * REFRACTION;
  float core = exp(-across * across * CONDUIT_SHARPNESS);
  float edges = smoothstep(1.0, 1.0 - EDGE_FADE, abs(vAcross));
  float ends = smoothstep(0.0, END_FADE, vAlong) * smoothstep(1.0, 1.0 - END_FADE, vAlong);
  float lit = smoothstep(uFront, uFront - CONDUIT_FEATHER, vAlong);
  float headOffset = (vAlong - uFront) / HEAD_SPREAD;
  float head = exp(-headOffset * headOffset) * step(0.001, uFront);
  float flow = 0.75 + 0.25 * sin((vAlong * CONDUIT_PULSES - uTime * FLOW_RATE) * 6.2832);
  float shimmer = 0.8 + 0.2 * shimmerAt(vWorldPoint, sway);
  float alpha = core * edges * ends * (lit * flow * BODY_GLOW + head * HEAD_GLOW) * shimmer * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), head * 0.35), alpha);
}

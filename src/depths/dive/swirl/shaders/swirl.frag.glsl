#include "/shaders/noise.glsl"

uniform float uCover;
uniform float uOpacity;
uniform float uTime;
uniform vec2 uCentre;
uniform float uAspect;
uniform vec3 uAbyss;
uniform vec3 uAbyssGlow;

varying vec2 vUv;

float farthestCorner(vec2 centre) {
  return length(max(centre, 1.0 - centre) * vec2(uAspect, 1.0));
}

void main() {
  vec2 offset = (vUv - uCentre) * vec2(uAspect, 1.0);
  float radius = length(offset);
  float reach = farthestCorner(uCentre) + FEATHER + WOBBLE;

  float swirl = atan(offset.y, offset.x) + SWIRL_TWIST / (radius + SWIRL_CORE) - uTime * SWIRL_SPEED;
  float streak = fbm(vec2(cos(swirl), sin(swirl)) * (STREAK_SCALE + radius * STREAK_STRETCH));

  float edge = mix(reach, -FEATHER - WOBBLE, uCover);
  float side = radius + (streak - 0.5) * 2.0 * WOBBLE - edge;
  float alpha = smoothstep(-FEATHER, FEATHER, side) * uOpacity;
  if (alpha <= 0.003) discard;

  vec3 color = mix(uAbyss, uAbyssGlow, smoothstep(STREAK_FROM, 1.0, streak) * STREAK_GLOW);
  float core = 1.0 - smoothstep(0.0, reach, radius);
  color = mix(color, uAbyss * CORE_SHADE, core * CORE_STRENGTH);
  float rim = 1.0 - smoothstep(0.0, FEATHER, abs(side));
  color = mix(color, uAbyssGlow, rim * RIM_GLOW);

  gl_FragColor = vec4(color, alpha);
}

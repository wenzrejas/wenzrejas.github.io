#include "/shaders/star.glsl"

uniform vec3 uColor;

varying float vFlash;

void main() {
  vec2 offset = gl_PointCoord * 2.0 - 1.0;
  float alpha = star(offset) * vFlash;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), starCore(offset)), alpha);
}

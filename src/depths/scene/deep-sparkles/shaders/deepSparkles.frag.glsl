#include "/shaders/star.glsl"

varying float vFlash;
varying vec3 vTint;

void main() {
  vec2 offset = gl_PointCoord * 2.0 - 1.0;
  float halo = 1.0 - smoothstep(0.0, 1.0, length(offset));
  float alpha = (star(offset) + HALO * halo * halo) * vFlash;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(vTint, vec3(1.0), starCore(offset) * CORE_WHITENESS), alpha);
}

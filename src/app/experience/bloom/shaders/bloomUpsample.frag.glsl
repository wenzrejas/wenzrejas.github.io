#include "./sourceTap.glsl"

void main() {
  vec3 edges = sourceAt(vec2(-1.0, 0.0)) + sourceAt(vec2(1.0, 0.0)) + sourceAt(vec2(0.0, -1.0)) + sourceAt(vec2(0.0, 1.0));
  vec3 tent = (sourceAt(vec2(0.0)) * 4.0 + edges * 2.0 + sourceCorners()) / 16.0;
  gl_FragColor = vec4(tent * SPREAD, 1.0);
}

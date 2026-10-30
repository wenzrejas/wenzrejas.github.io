#include "./sourceTap.glsl"

void main() {
  gl_FragColor = vec4((sourceAt(vec2(0.0)) * 4.0 + sourceCorners()) / 8.0, 1.0);
}

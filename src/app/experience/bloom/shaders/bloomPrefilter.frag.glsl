#include "./sourceTap.glsl"

uniform float uThreshold;

const vec3 LUMA_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);

void main() {
  vec3 color = sourceCorners() * 0.25;
  float brightness = dot(color, LUMA_WEIGHTS);
  gl_FragColor = vec4(color * smoothstep(uThreshold, uThreshold + SOFTNESS, brightness), 1.0);
}

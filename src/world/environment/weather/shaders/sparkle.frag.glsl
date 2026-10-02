uniform vec3  uColor;
uniform float uArmSharpness;
uniform float uArmFalloff;
uniform float uGlowRadius;

varying float vAlpha;

void main() {
  if (vAlpha < 0.005) discard;

  // gl_PointCoord [0,1]² → remap to [-1,1]²
  vec2 uv = gl_PointCoord * 2.0 - 1.0;

  // Horizontal arm: sharp in Y, gradual in X
  float hArm = exp(-abs(uv.y) * uArmSharpness) * exp(-abs(uv.x) * uArmFalloff);
  // Vertical arm: sharp in X, gradual in Y
  float vArm = exp(-abs(uv.x) * uArmSharpness) * exp(-abs(uv.y) * uArmFalloff);
  // Central radial glow
  float glow = exp(-length(uv) * uGlowRadius);

  float star = max(max(hArm, vArm), glow);
  if (star < 0.005) discard;

  gl_FragColor = vec4(uColor, star * vAlpha);
}

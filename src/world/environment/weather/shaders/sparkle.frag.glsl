uniform vec3  uColor;
uniform float uArmSharpness;
uniform float uArmFalloff;
uniform float uGlowRadius;

varying float vAlpha;

void main() {
  if (vAlpha < 0.005) discard;

  vec2 uv = gl_PointCoord * 2.0 - 1.0;

  float hArm = exp(-abs(uv.y) * uArmSharpness) * exp(-abs(uv.x) * uArmFalloff);
  float vArm = exp(-abs(uv.x) * uArmSharpness) * exp(-abs(uv.y) * uArmFalloff);
  float glow = exp(-length(uv) * uGlowRadius);

  float star = max(max(hArm, vArm), glow);
  if (star < 0.005) discard;

  gl_FragColor = vec4(uColor, star * vAlpha);
}

varying vec3 vTint;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
varying float vFade;
varying float vTentacle;
varying float vAlong;

void main() {
  vec3 normal = normalize(vViewNormal);
  float facing = abs(dot(normal, normalize(vViewDirection)));
  float rim = pow(1.0 - facing, RIM_POWER);
  float bell = BELL_GLOW * (0.6 + 0.4 * abs(normal.y)) + rim * RIM_GLOW;
  float tentacle = TENTACLE_GLOW * (1.0 - vAlong);
  float glow = mix(bell, tentacle, vTentacle) * vFade;
  if (glow <= 0.003) discard;
  vec3 color = mix(vTint, vec3(1.0), rim * 0.35 * (1.0 - vTentacle));
  gl_FragColor = vec4(color, glow);
}

uniform vec3 uDeep;
uniform vec3 uGold;
uniform vec3 uBright;
uniform vec3 uLight;

varying vec3 vNormal;
varying float vHeight;

void main() {
  vec3 normal = normalize(vNormal);
  float lit = dot(normal, uLight) * 0.5 + 0.5;
  vec3 color = mix(uDeep, uGold, smoothstep(DEEP_UNTIL, GOLD_FROM, lit));
  color = mix(color, uBright, smoothstep(BRIGHT_FROM, 1.0, lit));

  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float glint = smoothstep(GLINT_START, 1.0, dot(normal, halfway));
  float rim = pow(1.0 - abs(normal.z), 2.0) * RIM_GLOW;
  float tip = smoothstep(TIP_START, TIP_END, vHeight) * TIP_GLOW;
  gl_FragColor = vec4(color + uBright * (glint + rim + tip), 1.0);
}

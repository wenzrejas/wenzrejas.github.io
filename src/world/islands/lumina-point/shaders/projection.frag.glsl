uniform float uTime;
uniform float uLevel;

varying vec3  vColor;
varying float vHeight;
varying float vFacing;
varying float vWorldY;

void main() {
  float scan  = 1.0 - SCAN_DEPTH * (0.5 + 0.5 * sin((vWorldY * SCAN_DENSITY - uTime * SCAN_SPEED) * 6.2831853));
  float fade  = mix(1.0, 0.1, vHeight) * (1.0 - smoothstep(0.7, 1.0, vHeight));
  float depth = mix(0.25, 1.0, pow(vFacing, 1.5));

  float alpha = fade * depth * scan * STRENGTH * uLevel;
  if (alpha <= 0.003) discard;

  gl_FragColor = vec4(vColor, alpha);
}

uniform float uIntensity;

varying float vLife;

void main() {
  float mask = smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
  if (mask <= 0.0) discard;

  vec3 color = mix(vec3(1.0, 0.86, 0.55), vec3(0.95, 0.32, 0.08), smoothstep(0.0, 0.7, vLife));
  float fade = smoothstep(0.0, 0.12, vLife) * (1.0 - smoothstep(0.45, 1.0, vLife));

  gl_FragColor = vec4(color, mask * fade * uIntensity);
}

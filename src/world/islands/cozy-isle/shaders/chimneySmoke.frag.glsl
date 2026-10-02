uniform vec3  uColor;
uniform float uPresence;

varying float vLife;
varying float vSeed;

void main() {
  vec2  offset = gl_PointCoord - 0.5;
  float angle  = atan(offset.y, offset.x + 1e-5);
  float edge   = 0.44
               + 0.04 * sin(angle * 3.0 + vSeed + vLife * 2.0)
               + 0.02 * sin(angle * 5.0 - vSeed * 2.3);

  float mask  = 1.0 - smoothstep(edge - 0.14, edge, length(offset));
  float fade  = smoothstep(0.0, 0.1, vLife) * (1.0 - smoothstep(0.45, 1.0, vLife));
  float alpha = mask * fade * uPresence * OPACITY;
  if (alpha <= 0.003) discard;

  float shade = mix(1.0, SHADE, gl_PointCoord.y);
  gl_FragColor = vec4(uColor * shade, alpha);
}

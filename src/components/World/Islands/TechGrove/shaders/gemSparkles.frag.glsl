uniform vec3 uColor;

varying float vFlash;

float ray(float along, float across) {
  float reach = max(0.0, 1.0 - along);
  return reach * (1.0 - smoothstep(0.0, RAY_WIDTH * reach + 0.001, across));
}

void main() {
  vec2 offset = abs(gl_PointCoord * 2.0 - 1.0);
  float rays = max(ray(offset.x, offset.y), ray(offset.y, offset.x));
  float core = 1.0 - smoothstep(0.0, 0.3, length(offset));
  float alpha = clamp(rays + core, 0.0, 1.0) * vFlash;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), alpha);
}

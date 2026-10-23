uniform vec3 uColor;
uniform float uProgress;
uniform float uStrength;

varying vec2 vUv;

void main() {
  float radius = length(vUv * 2.0 - 1.0);
  if (radius > 1.0 || uProgress >= 1.0) discard;

  float ring = exp(-pow((radius - uProgress) / RING_WIDTH, 2.0));
  float wash = (1.0 - radius) * (1.0 - uProgress) * 0.25;
  float alpha = uStrength * (1.0 - uProgress) * (ring + wash);
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(uColor, alpha);
}

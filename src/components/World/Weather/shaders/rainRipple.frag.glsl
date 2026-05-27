uniform float uIntensity;
uniform vec3  uColor;

varying float vProgress;
varying vec2  vUV;

void main() {
  if (uIntensity < 0.01) discard;

  vec2 c = vUV - 0.5;
  float dist = length(c);

  float ring = smoothstep(0.38, 0.44, dist) * smoothstep(0.52, 0.45, dist);
  float fade = 1.0 - smoothstep(0.0, 1.0, vProgress);

  float alpha = ring * fade * uIntensity * 0.55;
  if (alpha < 0.005) discard;

  float lum   = dot(uColor, vec3(0.299, 0.587, 0.114));
  vec3  color = uColor * max(1.0, 0.20 / max(lum, 0.001));

  gl_FragColor = vec4(color, alpha);
}

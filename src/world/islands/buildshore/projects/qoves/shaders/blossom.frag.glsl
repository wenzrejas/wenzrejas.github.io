uniform vec3 uPetalColor;
uniform vec3 uHeartColor;

varying float vFade;
varying float vSpin;
varying float vTumble;

#define TAU 6.28318530718
#define PETALS 5.0

void main() {
  vec2  point = gl_PointCoord * 2.0 - 1.0;
  float c = cos(vSpin);
  float s = sin(vSpin);
  point = mat2(c, -s, s, c) * point;
  float tumble = 0.45 + 0.55 * abs(cos(vTumble));
  point.x /= tumble;

  float radius = length(point);
  float sector = mod(atan(point.y, point.x), TAU / PETALS) - TAU / (PETALS * 2.0);
  float outline = 0.6 + 0.4 * cos(sector * PETALS * 0.5);
  outline -= 0.2 * (1.0 - smoothstep(0.0, 0.14, abs(sector)));
  float flower = 1.0 - smoothstep(outline * 0.9 - 0.06, outline * 0.9, radius);

  float alpha = flower * vFade;
  if (alpha <= 0.02) discard;

  vec3 color = mix(uHeartColor, uPetalColor, smoothstep(0.08, 0.55, radius));
  gl_FragColor = vec4(color * (0.85 + 0.15 * tumble), alpha);
}

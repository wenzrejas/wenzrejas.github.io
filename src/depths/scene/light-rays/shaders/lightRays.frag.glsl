uniform vec3 uColor;
uniform float uTime;

varying vec2 vShaft;
varying float vSeed;
varying float vDrop;

void main() {
  float across = vShaft.x;
  float along = vShaft.y;
  float sway = sin(uTime * SHIMMER_RATE + vSeed * 6.2832) * SWAY * along;
  float core = 1.0 - smoothstep(0.0, 1.0, abs(across - sway));
  float shimmer = 0.65 + 0.35 * sin(uTime * SHIMMER_RATE * 1.7 + vSeed * 11.0 + along * 3.0);
  float ends = smoothstep(0.0, 0.06, along) * (1.0 - smoothstep(0.85, 1.0, along));
  float reach = exp(-vDrop / REACH);
  float alpha = STRENGTH * core * core * shimmer * ends * reach * (0.5 + 0.5 * vSeed);
  if (alpha <= 0.002) discard;
  gl_FragColor = vec4(uColor, alpha);
}

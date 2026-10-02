#include "./algaeMask.glsl"

uniform float uTime;
uniform vec3  uTrail[TRAIL_POINTS];

varying vec2  vWorld;
varying float vWave;

void main() {
  float mask = algaeMask(vWorld);
  if (mask <= 0.002) discard;

  vec2 push = vec2(0.0);
  float excite = 0.0;
  float cleared = 0.0;
  for (int i = 0; i < TRAIL_POINTS; i++) {
    vec3 point = uTrail[i];
    float age = uTime - point.z;
    if (age > TRAIL_LIFE) break;
    vec2 away = vWorld - point.xy;
    float dist = length(away);
    float settle = 1.0 - age / TRAIL_LIFE;
    float reach = SCATTER_RADIUS * (0.6 + 0.4 * min(age / 0.6, 1.0));
    float weight = (1.0 - smoothstep(0.0, reach, dist)) * settle;
    push += away / max(dist, 0.001) * weight;
    excite = max(excite, weight);
    cleared = max(cleared, (1.0 - smoothstep(0.0, reach * 0.45, dist)) * settle);
  }
  vec2 offset = length(push) > 0.0 ? normalize(push) * excite * SCATTER_PUSH : vec2(0.0);

  vec2 q = (vWorld - offset) * SPECK_SCALE;
  vec2 cell = floor(q);
  vec2 local = fract(q);
  float seed = algaeHash(cell);
  vec2 centre = vec2(algaeHash(cell + 7.1), algaeHash(cell + 3.7)) * 0.6 + 0.2;
  float inside = step(max(abs(local.x - centre.x), abs(local.y - centre.y)), SPECK_SIZE);
  float twinkle = 0.5 + 0.5 * sin(uTime * (1.5 + seed * 3.0) + seed * 40.0);
  float speck = step(SPECK_THRESHOLD, seed) * inside * (1.0 - cleared);

  float drift = algaeNoise(vWorld * 0.05 + vec2(uTime * 0.02, -uTime * 0.015));
  float base = (0.05 + 0.08 * drift) * uAlgaeAmbient + excite * 0.12;
  float sparkle = speck * (0.9 * twinkle * uAlgaeAmbient + excite * 1.5);

  float crest = mix(CREST_DIM, CREST_BRIGHT, smoothstep(-0.4, 0.6, vWave));

  gl_FragColor = vec4(uAlgaeGlow * (base + sparkle) * mask * crest, 1.0);
}

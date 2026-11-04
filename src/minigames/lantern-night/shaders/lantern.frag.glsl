uniform float uTime;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHot;
uniform vec3 uHoop;
uniform vec3 uUnlit;
uniform vec3 uUnlitHoop;

varying vec2 vShape;
varying vec2 vAround;
varying vec3 vWorldNormal;
varying vec3 vViewNormal;
varying float vLit;
varying float vSeed;
varying float vPresence;
varying float vCrest;

void main() {
  float height = vShape.x;
  float cap = vShape.y;

  float facing = clamp(normalize(vViewNormal).z, 0.0, 1.0);
  float rounding = mix(EDGE_SHADE, 1.0, sqrt(facing));
  float offCorner = abs(abs(vAround.x) - abs(vAround.y)) / max(abs(vAround.x) + abs(vAround.y), 0.001);
  float seam = (1.0 - smoothstep(0.0, SEAM_WIDTH, offCorner)) * (1.0 - cap);
  float hoop = (1.0 - smoothstep(0.0, HOOP_SHARE, height)) * (1.0 - cap);

  float flicker = 1.0 + FLICKER * sin(uTime * FLICKER_RATE + vSeed * 40.0) * sin(uTime * FLICKER_RATE * 0.37 + vSeed * 17.0);
  float fromHot = (height - HOT_HEIGHT) / HOT_SPREAD;
  float hot = exp(-fromHot * fromHot) * mix(0.6, 1.0, facing) * flicker;

  vec3 paper = mix(uTop, uMid, smoothstep(0.2, 0.65, hot));
  paper = mix(paper, uHot, smoothstep(0.65, 1.0, hot));
  paper *= rounding * (1.0 + (vSeed - 0.5) * TONE_VARIATION);
  paper = mix(paper, uTop * CAP_TONE, cap);
  paper *= 1.0 - seam * (1.0 - SEAM_SHADE);
  vec3 litColor = mix(paper, uHoop, hoop);

  float moonlight = clamp(dot(normalize(vWorldNormal), normalize(vec3(-0.4, 0.75, 0.55))), 0.0, 1.0);
  vec3 unlit = uUnlit * mix(UNLIT_SHADE_LOW, UNLIT_SHADE_HIGH, moonlight) * rounding;
  unlit += uMid * exp(-fromHot * fromHot * UNLIT_EMBER_TIGHTNESS) * facing * (1.0 - cap) * UNLIT_EMBER * flicker;
  unlit *= 1.0 - seam * (1.0 - SEAM_SHADE);
  vec3 unlitColor = mix(unlit, uUnlitHoop, hoop);

  gl_FragColor = vec4(mix(unlitColor * vCrest, litColor, vLit), vPresence);
}

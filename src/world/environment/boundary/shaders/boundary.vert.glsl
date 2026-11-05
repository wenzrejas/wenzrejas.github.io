attribute float aLift;
uniform float uTime;
uniform float uRadius;
uniform float uFalloff;
uniform float uHeight;
uniform vec2 uLight;
varying vec2 vWorldXZ;
varying vec4 vMistUv;
varying vec4 vLitUv;
varying float vLift;

const float SMOOTHSTEP_INPUT_FLOOR = 0.75;

float innerEdge() {
  if (aLift == 0.0) return -FOG_HAZE_REACH;
  float sheetTop = FOG_SHEET_LEVEL * (FOG_SHEET_SWELL_BASE + FOG_SHEET_SWELL);
  if (aLift < sheetTop) return -FOG_SHEET_REACH;
  float riseNeeded = (aLift - sheetTop) / (1.0 - sheetTop);
  float riseShare = riseNeeded * SMOOTHSTEP_INPUT_FLOOR;
  return mix(FOG_RISE_START, FOG_RISE_END, riseShare) - FOG_RISE_WARP * 0.5;
}

float outerReach() {
  bool coveredByFloor = aLift + FOG_SOFT + 1.0 / FOG_SHELLS < FOG_VALLEY;
  return coveredByFloor ? uFalloff * (FOG_RISE_END + FOG_RISE_WARP * 0.5) : FOG_OUTER_MARGIN;
}

vec4 mistUv(vec2 mist) {
  vec2 seen = vec2(dot(mist, FOG_SEEN_ACROSS), dot(mist, FOG_SEEN_RISE));
  return vec4(
    seen / FOG_BROAD_TILE + uTime * vec2(0.0048, 0.0032),
    seen / FOG_FINE_TILE + uTime * vec2(-0.0072, 0.011) + vec2(0.37, 0.61)
  );
}

void main() {
  float spread = length(position.xy);
  vec2 spoke = position.xy / spread;
  float inner = uRadius + uFalloff * innerEdge();
  float reach = mix(inner, uRadius + outerReach(), spread - 1.0);

  vWorldXZ = vec2(spoke.x, -spoke.y) * reach;
  vLift = aLift;

  vec2 mist = vWorldXZ + FOG_LEAN * aLift * uHeight;
  vMistUv = mistUv(mist);
  vLitUv = mistUv(mist + uLight * FOG_LIGHT_STEP);

  vec4 worldPos = vec4(vWorldXZ.x, FOG_FLOOR_Y + aLift * uHeight, vWorldXZ.y, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}

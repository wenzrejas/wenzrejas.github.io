// World-space rain. Drops fall straight down (with slight wind tilt) in world Y
// from sky to ocean surface. Each drop fades out as it reaches y=0.

uniform float uTime;
uniform float uIntensity;
uniform vec2  uWindDir;  // XZ wind direction (worldX, worldZ)
uniform vec2  uShipXZ;   // ship world position XZ

attribute vec3 aSeed;   // (xSeed, phaseSeed, zSeed)  all 0..1
attribute vec2 aCorner; // (-0.5|+0.5  left/right,  0=tip | 1=tail)

varying float vV;
varying float vDistFade;

// Camera right in world space (fixed: camera is always at ship+[200,140,200])
const vec3 CAM_RIGHT = vec3(0.7071, 0.0, -0.7071);

const float AREA      = 560.0;
const float DROP_TOP  = 160.0;
const float DROP_BOT  = -5.0;
const float SPEED     = 150.0;
const float DROP_W    = 0.30;
const float DROP_LEN  = 16.0;
const float WIND_TILT = 0.20;

const float CAM_DX = 200.0;
const float CAM_DY = 140.0;
const float CAM_DZ = 200.0;

void main() {
  // ── Per-drop random values derived from seed ─────────────────────────────────
  // Each gives an independent pseudo-random float in 0..1
  float r1 = fract(aSeed.x * 73.6  + aSeed.z * 41.2);  // tilt X
  float r2 = fract(aSeed.y * 113.5 + aSeed.x * 29.7);  // tilt Z
  float r3 = fract(aSeed.z * 89.3  + aSeed.y * 67.1);  // speed
  float r4 = fract(r1 * 57.4       + r3 * 31.8);       // length

  // ── World XZ position ─────────────────────────────────────────────────────────
  float wx = uShipXZ.x + (aSeed.x - 0.5) * AREA;
  float wz = uShipXZ.y + (aSeed.z - 0.5) * AREA;

  // ── Y cycling ────────────────────────────────────────────────────────────────
  float yRange   = DROP_TOP - DROP_BOT;
  float cycleLen = yRange / SPEED;
  float t        = mod(uTime + aSeed.y * cycleLen, cycleLen);
  float dropY    = DROP_TOP - t * SPEED;

  // ── Per-drop fall direction (wind + turbulence) ───────────────────────────────
  float tiltX = uWindDir.x * WIND_TILT + (r1 - 0.5) * 0.15;
  float tiltZ = uWindDir.y * WIND_TILT + (r2 - 0.5) * 0.15;
  vec3 fallDir = normalize(vec3(tiltX, -1.0, tiltZ));

  // ── Wind drift in XZ ─────────────────────────────────────────────────────────
  vec3 base = vec3(
    wx + tiltX * SPEED * t,
    dropY,
    wz + tiltZ * SPEED * t
  );

  // ── Per-drop length variation (0.65 – 1.35×) ─────────────────────────────────
  float dropLen = DROP_LEN * (0.65 + r4 * 0.70);

  // ── Build quad ────────────────────────────────────────────────────────────────
  vec3 pos = base
    + CAM_RIGHT * (aCorner.x * DROP_W)
    - fallDir   * (aCorner.y * dropLen);

  // ── Fade out as tip reaches ocean surface ────────────────────────────────────
  float surfaceFade = smoothstep(-5.0, 18.0, dropY);

  // ── Distance-based fade ───────────────────────────────────────────────────────
  vec3  camPos  = vec3(uShipXZ.x + CAM_DX, CAM_DY, uShipXZ.y + CAM_DZ);
  float dist    = length(pos - camPos);
  float distFade = 1.0 - smoothstep(180.0, 460.0, dist);

  vDistFade = distFade * surfaceFade;
  vV = aCorner.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

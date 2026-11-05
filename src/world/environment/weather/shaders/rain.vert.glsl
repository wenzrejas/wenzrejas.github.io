uniform float uTime;
uniform float uIntensity;
uniform vec2  uWindDirection;
uniform vec2  uShipXZ;

attribute vec3 aSeed;
attribute vec2 aCorner;

varying float vAlong;
varying float vAcross;
varying float vDistFade;

const vec3 CAM_RIGHT = vec3(0.7071, 0.0, -0.7071);

const float AREA      = 560.0;
const float DROP_TOP  = 160.0;
const float DROP_BOT  = -5.0;
const float SPEED     = 450.0;
const float DROP_W    = 0.50;
const float DROP_LEN  = 20.0;
const float WIND_TILT = 0.20;

const float CAM_DX = 200.0;
const float CAM_DY = 140.0;
const float CAM_DZ = 200.0;

void main() {
  // ── Per-drop random values ──────────────────────────────────────────────────
  float randomA = fract(aSeed.x * 73.6  + aSeed.z * 41.2);
  float randomB = fract(aSeed.y * 113.5 + aSeed.x * 29.7);
  float randomC = fract(aSeed.z * 89.3  + aSeed.y * 67.1);
  float randomD = fract(randomA * 57.4       + randomC * 31.8);

  // ── World XZ position ───────────────────────────────────────────────────────
  float dropX = uShipXZ.x + (aSeed.x - 0.5) * AREA;
  float dropZ = uShipXZ.y + (aSeed.z - 0.5) * AREA;

  // ── Y cycling ───────────────────────────────────────────────────────────────
  float yRange   = DROP_TOP - DROP_BOT;
  float cycleLen = yRange / SPEED;
  float cycleTime        = mod(uTime + aSeed.y * cycleLen, cycleLen);
  float dropY    = DROP_TOP - cycleTime * SPEED;

  // ── Per-drop fall direction ─────────────────────────────────────────────────
  float tiltX = uWindDirection.x * WIND_TILT + (randomA - 0.5) * 0.06;
  float tiltZ = uWindDirection.y * WIND_TILT + (randomB - 0.5) * 0.06;
  vec3 fallDir = normalize(vec3(tiltX, -1.0, tiltZ));

  // ── Wind drift ──────────────────────────────────────────────────────────────
  vec3 base = vec3(
    dropX + tiltX * SPEED * cycleTime,
    dropY,
    dropZ + tiltZ * SPEED * cycleTime
  );

  // ── Per-drop length ─────────────────────────────────────────────────────────
  float dropLen = DROP_LEN * (0.65 + randomD * 0.70);

  // ── Build quad ──────────────────────────────────────────────────────────────
  vec3 dropPosition = base
    + CAM_RIGHT * (aCorner.x * DROP_W)
    - fallDir   * (aCorner.y * dropLen);

  // ── Surface fade ────────────────────────────────────────────────────────────
  float surfaceFade = smoothstep(-5.0, 18.0, dropY);

  // ── Distance fade ───────────────────────────────────────────────────────────
  vec3  camPos  = vec3(uShipXZ.x + CAM_DX, CAM_DY, uShipXZ.y + CAM_DZ);
  float viewDistance    = length(dropPosition - camPos);
  float distFade = 1.0 - smoothstep(180.0, 460.0, viewDistance);

  vDistFade = distFade * surfaceFade;
  vAlong = aCorner.y;
  vAcross = aCorner.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(dropPosition, 1.0);
}

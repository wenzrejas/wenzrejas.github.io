attribute vec3 aSeed; // x: world seed [0..1), y: world seed [0..1), z: twinkle seed [0..1]

uniform float uTime;
uniform vec2  uShipXZ;
uniform float uIntensity;

// Tiling period — AREA/2 (325) > max visible frustum extent (~300 wu)
// so wrap-jumps always happen outside the screen.
const float AREA = 650.0;

varying float vAlpha;

void main() {
  // Per-sparkle twinkling — unique rate and phase
  float rate    = 1.2 + aSeed.z * 3.8;
  float phase   = aSeed.x * 37.5 + aSeed.y * 23.1 + aSeed.z * 61.3;
  float t       = sin(uTime * rate + phase) * 0.5 + 0.5;
  float twinkle = pow(t, 5.0); // narrow bright flash

  vAlpha = twinkle * uIntensity;

  // World-space stable position.
  // Each sparkle has a fixed world-reference (seedX, seedZ) that tiles every AREA.
  // floor(...+ 0.5) picks the nearest tile to the ship so the sparkle stays
  // within AREA/2 of the ship — but is never moved by the ship directly.
  float seedX  = aSeed.x * AREA;
  float seedZ  = aSeed.y * AREA;
  float worldX = seedX + floor((uShipXZ.x - seedX) / AREA + 0.5) * AREA;
  float worldZ = seedZ + floor((uShipXZ.y - seedZ) / AREA + 0.5) * AREA;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(worldX, 1.5, worldZ, 1.0);
  gl_PointSize = 1.5 + twinkle * 6.5;
}

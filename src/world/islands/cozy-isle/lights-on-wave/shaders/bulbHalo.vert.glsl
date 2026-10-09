uniform float uSeconds;
uniform float uSize;

attribute float aDelay;

varying float vFlash;

void main() {
  float since = uSeconds - aDelay;
  float lit   = smoothstep(0.0, LIGHT_SECONDS, since);
  float flash = lit * exp(-max(since, 0.0) / FLASH_DECAY_SECONDS);
  vFlash = lit + FLASH * flash;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * lit * (1.0 + GROWTH * flash);
}

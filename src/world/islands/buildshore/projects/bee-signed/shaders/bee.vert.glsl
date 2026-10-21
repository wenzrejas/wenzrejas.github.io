uniform float uSize;

attribute vec3  aPrevious;
attribute float aFade;
attribute float aSeed;

varying float vFade;
varying float vFacing;
varying float vSeed;

void main() {
  vec4 clip     = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 previous = projectionMatrix * modelViewMatrix * vec4(aPrevious, 1.0);
  vFacing = clip.x / clip.w < previous.x / previous.w ? -1.0 : 1.0;
  vFade   = aFade;
  vSeed   = aSeed;

  gl_Position  = clip;
  gl_PointSize = uSize * min(1.0, aFade * 3.0);
}

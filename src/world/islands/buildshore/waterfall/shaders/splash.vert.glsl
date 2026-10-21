uniform float uFlowTime;
uniform float uPixelsPerUnit;

attribute vec3 aSpan;
attribute vec3 aAway;
attribute vec4 aSeed;

void main() {
  float progress = fract(uFlowTime * SPLASH_RATE * aSeed.w + aSeed.z);
  float reach    = 1.0 - (1.0 - progress) * (1.0 - progress);

  vec3 spot = position + aSpan * aSeed.x;
  spot     += aAway * cos(aSeed.y) * reach * SPLASH_REACH;
  spot.y   += sin(aSeed.y) * reach * SPLASH_HEIGHT;

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(spot, 1.0);
  gl_PointSize = (1.0 - progress) * SPLASH_SIZE * uPixelsPerUnit;
}

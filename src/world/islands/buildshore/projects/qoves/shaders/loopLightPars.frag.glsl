uniform float uCometHead;
uniform float uCometLevel;
uniform vec3  uCometColor;

varying vec2 vLoopPlane;

float loopComet() {
  float behind = fract((atan(vLoopPlane.y, vLoopPlane.x) - uCometHead) / 6.28318530718);
  float trail  = 1.0 - smoothstep(0.0, COMET_TRAIL_SHARE, behind);
  float lead   = 1.0 - smoothstep(0.0, COMET_HEAD_SHARE, 1.0 - behind);
  return max(trail, lead) * uCometLevel;
}

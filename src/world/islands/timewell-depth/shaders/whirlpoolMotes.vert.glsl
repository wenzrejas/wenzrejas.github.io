uniform float uTime;
uniform float uSize;
uniform float uRise;
uniform float uMagic;

attribute vec4 aSeed;

varying float vAlpha;
varying float vShare;

void main() {
  float life = fract(uTime / MOTE_LIFETIME + aSeed.x);
  float surface = -FUNNEL_DEPTH * pow(max(1.0 - aSeed.z, 0.0), FUNNEL_CURVE);
  vec3 rising = vec3(
    cos(aSeed.y) * aSeed.z,
    surface + pow(life, 1.3) * uRise,
    -sin(aSeed.y) * aSeed.z
  );

  float twinkle = 0.7 + 0.3 * sin(uTime * 3.0 + aSeed.x * 40.0);
  vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.6, 1.0, life)) * twinkle * uMagic;
  vAlpha *= MOTE_STRENGTH;
  vShare = aSeed.z;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(rising, 1.0);
  gl_PointSize = uSize * aSeed.w * (1.0 - 0.4 * life);
}

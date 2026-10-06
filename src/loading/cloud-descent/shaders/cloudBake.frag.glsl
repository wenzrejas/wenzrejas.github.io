#include "./cloudNoise.glsl"

uniform float uAspect;
uniform float uScale;
uniform vec2  uOrigin;

varying vec2 vUv;

const vec2 SUNWARD = vec2(-0.6, 0.8);

void main() {
  vec2 screen = (vUv * (1.0 + 2.0 * CLOUD_BAKE_MARGIN) - CLOUD_BAKE_MARGIN - 0.5) * vec2(uAspect, 1.0);
  vec2 point  = screen * uScale;
  point.y    *= CLOUD_TILT;
  point      += uOrigin;

  float body      = cloudFbm(point, int(CLOUD_OCTAVES));
  float bulgeSide = cloudFbm(point + SUNWARD * BULGE_LIGHT_STEP, 3);
  float massSide  = cloudFbm(point + SUNWARD * MASS_LIGHT_STEP, 2);
  float lit       = 0.5 + 0.5 * tanh(LIGHT_BIAS + (body - bulgeSide) * BULGE_LIGHT_GAIN
                                                + (body - massSide) * MASS_LIGHT_GAIN);

  gl_FragColor = vec4(body, lit, 0.0, 1.0);
}

uniform sampler2D uSource;
uniform vec2 uSourceTexel;

varying vec2 vUv;

vec3 sourceAt(vec2 texelOffset) {
  return texture2D(uSource, vUv + texelOffset * uSourceTexel).rgb;
}

vec3 sourceCorners() {
  return sourceAt(vec2(-1.0)) + sourceAt(vec2(1.0, -1.0)) + sourceAt(vec2(-1.0, 1.0)) + sourceAt(vec2(1.0));
}

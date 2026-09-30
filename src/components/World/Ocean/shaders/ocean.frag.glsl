#include "./oceanSurface.glsl"

uniform float uTime;
uniform float uScale;
uniform float uSmoothness;
uniform float uFlowX;
uniform float uFlowZ;
uniform float uCellSpeed;
uniform float uNoiseScale;
uniform float uNoiseFlowSpeed;
uniform float uDistortAmount;
uniform vec3  uFoamColor;
uniform float uFoamAmount;
uniform float uCrestStrength;

varying vec2  vWorldPos;
varying vec3  vPos;
varying vec3  vNormal;
varying float vWaveHeight;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k / 6.0;
}

vec2 cellPt(vec2 seed) {
  return 0.5 + 0.5 * sin(uTime * uCellSpeed + 6.2831 * seed);
}

vec2 voronoiEdge(vec2 p) {
  vec2 i = floor(p), f = p - i;
  float md = 8.0, res = 8.0;
  for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec2  n = vec2(float(x), float(y));
      float d = length(n + cellPt(hash2(i + n)) - f);
      md  = min(md, d);
      res = smin(res, d, uSmoothness);
    }
  return vec2(md, res);
}

float nHash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(nHash(i),                  nHash(i + vec2(1.0, 0.0)), f.x),
    mix(nHash(i + vec2(0.0, 1.0)), nHash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 2; i++) { v += a * vnoise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 noiseUV = vWorldPos * uNoiseScale + vec2(uTime * uNoiseFlowSpeed, 0.0);
  vec2 distort = vec2(
    fbm(noiseUV),
    fbm(noiseUV + vec2(5.2, 1.3))
  ) - 0.5;
  distort *= uDistortAmount;

  vec2 uv = vWorldPos * uScale + vec2(uFlowX, uFlowZ) * uTime + distort;

  vec2  vor  = voronoiEdge(uv);
  float edge = vor.x - vor.y;

  float t = oceanTone(edge);
  vec4 surface = oceanSurface(t, vNormal, vPos);
  vec3 color = surface.rgb;

  float crestFactor = smoothstep(0.1, 0.72, vWaveHeight);
  color = mix(color, uFoamColor, crestFactor * uCrestStrength);

  float alpha = surface.a;

  vec2  foamUV    = vWorldPos * uNoiseScale * 2.1 + vec2(uFlowX, uFlowZ) * uTime * 0.4 + vec2(4.7, 2.1);
  float foamNoise = fbm(foamUV);
  float foamEdge  = smoothstep(uEdgeThreshold * 0.3, uEdgeThreshold + uEdgeSoftness * 1.5, edge);
  float crest     = smoothstep(0.12, 0.60, vWaveHeight);
  float foam      = clamp(foamEdge + crest * 0.75, 0.0, 1.0)
                  * smoothstep(0.38, 0.56, foamNoise)
                  * uFoamAmount;
  color = mix(color, uFoamColor, foam);
  alpha = max(alpha, foam);

  float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  color += (dither - 0.5) / 255.0;

  gl_FragColor = vec4(color, alpha);
}

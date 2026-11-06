#include "./oceanSurface.glsl"
#include "/shaders/quinticNoise.glsl"
#include "/shaders/smoothMin.glsl"

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

vec2 hash2(vec2 point) {
  point = vec2(dot(point, vec2(127.1, 311.7)), dot(point, vec2(269.5, 183.3)));
  return fract(sin(point) * 43758.5453);
}

vec2 cellPt(vec2 seed) {
  return 0.5 + 0.5 * sin(uTime * uCellSpeed + 6.2831 * seed);
}

vec2 voronoiEdge(vec2 point) {
  vec2 i = floor(point), f = point - i;
  float nearest = 8.0, blended = 8.0;
  for (int y = -1; y <= 1; y++)
    for (int x = -1; x <= 1; x++) {
      vec2  neighbour = vec2(float(x), float(y));
      float cellGap = length(neighbour + cellPt(hash2(i + neighbour)) - f);
      nearest  = min(nearest, cellGap);
      blended = smin(blended, cellGap, uSmoothness);
    }
  return vec2(nearest, blended);
}

float fbm(vec2 point) {
#ifdef LIGHT_NOISE
  return LIGHT_NOISE_MEAN + LIGHT_NOISE_SPREAD * (vnoise(point) - 0.5);
#else
  float value = 0.0, amplitude = 0.5;
  for (int i = 0; i < 2; i++) { value += amplitude * vnoise(point); point *= 2.0; amplitude *= 0.5; }
  return value;
#endif
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

  float tone = oceanTone(edge);
  vec4 surface = oceanSurface(tone, vNormal, vPos);
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

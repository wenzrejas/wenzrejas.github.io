uniform float uTime;
uniform float uScale;
uniform float uSmoothness;
uniform float uEdgeThreshold;
uniform float uEdgeSoftness;
uniform float uFlowX;
uniform float uFlowZ;
uniform float uCellSpeed;
uniform float uNoiseScale;
uniform float uNoiseFlowSpeed;
uniform float uDistortAmount;
uniform vec3  uDeepColor;
uniform vec3  uMidColor;
uniform float uMidPos;
uniform vec3  uHighlight;
uniform float uOpacity;
uniform float uDeepOpacity;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform float uFoamAmount;
uniform float uSpecularStrength;
uniform float uSpecularPower;
uniform float uCrestStrength;
uniform vec3  uSunDir;
uniform vec3  uMoonDir;
uniform float uMoonIntensity;
uniform float uCloudCover;
uniform vec2  uCloudOffset;
uniform float uCloudTime;
uniform float uCloudDark;

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

// 2x2 neighborhood — floor(p-0.5) ensures p always sits inside the sampled 2x2 block
float voronoiF1(vec2 p) {
  vec2 i = floor(p - 0.5), f = p - i;
  float md = 8.0;
  for (int y = 0; y <= 1; y++)
    for (int x = 0; x <= 1; x++) {
      vec2 n  = vec2(float(x), float(y));
      vec2 pt = cellPt(hash2(i + n));
      md = min(md, length(n + pt - f));
    }
  return md;
}

float voronoiSF1(vec2 p) {
  vec2 i = floor(p - 0.5), f = p - i;
  float res = 8.0;
  for (int y = 0; y <= 1; y++)
    for (int x = 0; x <= 1; x++) {
      vec2 n  = vec2(float(x), float(y));
      vec2 pt = cellPt(hash2(i + n));
      res = smin(res, length(n + pt - f), uSmoothness);
    }
  return res;
}

float nHash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
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

float cHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2  cGrad(vec2 p) { float h = cHash(p) * 6.28318; return vec2(cos(h), sin(h)); }
float cGnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(cGrad(i),           f          ), dot(cGrad(i+vec2(1,0)), f-vec2(1,0)), u.x),
    mix(dot(cGrad(i+vec2(0,1)), f-vec2(0,1)), dot(cGrad(i+vec2(1,1)), f-vec2(1,1)), u.x),
    u.y
  ) * 0.5 + 0.5;
}
float cFbm(vec2 p) {
  const mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * cGnoise(p);
    p  = rot * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float cloudCoverage(vec2 worldXZ) {
  vec2 uv = worldXZ * 0.006 + uCloudOffset;
  float t = uCloudTime * 0.015;
  vec2  w = vec2(
    cGnoise(uv * 0.5 + vec2(t,   1.9        )),
    cGnoise(uv * 0.5 + vec2(9.7, 6.4 + t*0.7))
  ) - 0.5;
  float n = cFbm(uv + w * 0.35);

  float threshold = mix(0.64, 0.40, uCloudCover);
  float soft = 0.20;
  float aa   = clamp(fwidth(n), 0.0, 0.04);
  return smoothstep(threshold - soft - aa, threshold + soft + aa, n);
}

void main() {
  vec2 noiseUV = vWorldPos * uNoiseScale + vec2(uTime * uNoiseFlowSpeed, 0.0);
  // Two independent FBM samples so X and Z distort differently (avoids diagonal-only warp)
  vec2 distort = vec2(
    fbm(noiseUV),
    fbm(noiseUV + vec2(5.2, 1.3))
  ) - 0.5;
  distort *= uDistortAmount;

  vec2 uv = vWorldPos * uScale + vec2(uFlowX, uFlowZ) * uTime + distort;

  float f1  = voronoiF1(uv);
  float sf1 = voronoiSF1(uv);
  float edge = f1 - sf1;

  float t = smoothstep(
    uEdgeThreshold - uEdgeSoftness,
    uEdgeThreshold + uEdgeSoftness,
    edge
  );

  float safeMP = max(uMidPos, 1e-4);
  float seg0   = clamp(t / safeMP, 0.0, 1.0);
  float seg1   = clamp((t - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
  float inSeg1 = step(safeMP, t);
  vec3 color   = mix(
    mix(uDeepColor, uMidColor, seg0),
    mix(uMidColor,  uHighlight, seg1),
    inSeg1
  );

  // Analytical wave normal from vertex shader
  vec3 N       = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vPos);

  // Fresnel — uses per-vertex wave normal (smoother than screen-space dFdx)
  float nDotV  = clamp(dot(N, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - nDotV, uFresnelPower) * uFresnelStrength;
  color = mix(color, uHighlight, fresnel);

  // Blinn-Phong specular — sun
  vec3  sunDir = normalize(uSunDir);
  vec3  H      = normalize(sunDir + viewDir);
  float spec   = pow(max(dot(N, H), 0.0), uSpecularPower) * uSpecularStrength;
  color = mix(color, uHighlight, spec);

  // Blinn-Phong specular — moon (tight, cool-blue reflection)
  vec3  moonDir = normalize(uMoonDir);
  vec3  Hm      = normalize(moonDir + viewDir);
  float moonSpec = pow(max(dot(N, Hm), 0.0), 64.0) * uMoonIntensity * 0.45;
  color = mix(color, vec3(0.72, 0.82, 1.0), clamp(moonSpec, 0.0, 1.0));

  // Smooth crest highlight — continuous height-based brightening, no noise gate
  float crestFactor = smoothstep(0.1, 0.72, vWaveHeight);
  color = mix(color, uHighlight, crestFactor * uCrestStrength);

  float shadow = cloudCoverage(vWorldPos) * uCloudDark;
  color *= mix(vec3(1.0), vec3(0.08, 0.11, 0.17), shadow);

  float alpha = mix(uDeepOpacity, 1.0, max(t, fresnel)) * uOpacity;

  // Foam — patchy noise layer on top of crest highlight
  vec2  foamUV    = vWorldPos * uNoiseScale * 2.1 + vec2(uFlowX, uFlowZ) * uTime * 0.4 + vec2(4.7, 2.1);
  float foamNoise = fbm(foamUV);
  // Edge foam at Voronoi cell boundaries
  float foamEdge  = smoothstep(uEdgeThreshold * 0.3, uEdgeThreshold + uEdgeSoftness * 1.5, edge);
  // Crest foam — lower threshold so foam covers more of the peak
  float crest     = smoothstep(0.12, 0.60, vWaveHeight);
  float foam      = clamp(foamEdge + crest * 0.75, 0.0, 1.0)
                  * smoothstep(0.38, 0.56, foamNoise)
                  * uFoamAmount;
  color = mix(color, vec3(1.0), foam);
  alpha = max(alpha, foam);

  gl_FragColor = vec4(color, alpha);
}

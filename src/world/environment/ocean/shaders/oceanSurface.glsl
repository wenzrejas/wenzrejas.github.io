uniform float uEdgeThreshold;
uniform float uEdgeSoftness;
uniform vec3  uDeepColor;
uniform vec3  uMidColor;
uniform float uMidPos;
uniform vec3  uHighlight;
uniform float uOpacity;
uniform float uDeepOpacity;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform float uSpecularStrength;
uniform float uSpecularPower;
uniform vec3  uSunDir;
uniform vec3  uMoonDir;
uniform float uMoonIntensity;

float oceanTone(float edge) {
  return smoothstep(uEdgeThreshold - uEdgeSoftness, uEdgeThreshold + uEdgeSoftness, edge);
}

vec4 oceanSurface(float t, vec3 normal, vec3 position) {
  float safeMP = max(uMidPos, 1e-4);
  float seg0   = clamp(t / safeMP, 0.0, 1.0);
  float seg1   = clamp((t - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
  float inSeg1 = step(safeMP, t);
  vec3 color   = mix(
    mix(uDeepColor, uMidColor, seg0),
    mix(uMidColor,  uHighlight, seg1),
    inSeg1
  );

  vec3 N       = normalize(normal);
  vec3 viewDir = normalize(cameraPosition - position);

  float nDotV  = clamp(dot(N, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - nDotV, uFresnelPower) * uFresnelStrength;
  color = mix(color, uHighlight, fresnel);

  vec3  sunDir = normalize(uSunDir);
  vec3  H      = normalize(sunDir + viewDir);
  float spec   = pow(max(dot(N, H), 0.0), uSpecularPower) * uSpecularStrength;
  color = mix(color, uHighlight, spec);

  vec3  moonDir = normalize(uMoonDir);
  vec3  Hm      = normalize(moonDir + viewDir);
  float moonSpec = pow(max(dot(N, Hm), 0.0), 64.0) * uMoonIntensity * 0.45;
  color = mix(color, vec3(0.72, 0.82, 1.0), clamp(moonSpec, 0.0, 1.0));

  return vec4(color, mix(uDeepOpacity, 1.0, max(t, fresnel)) * uOpacity);
}

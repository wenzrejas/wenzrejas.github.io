uniform float uEdgeThreshold;
uniform float uEdgeSoftness;
uniform vec3  uDeepColor;
uniform vec3  uMidColor;
uniform float uMidPosition;
uniform vec3  uHighlight;
uniform float uOpacity;
uniform float uDeepOpacity;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform float uSpecularStrength;
uniform float uSpecularPower;
uniform vec3  uSunDirection;
uniform vec3  uMoonDirection;
uniform float uMoonIntensity;

float oceanTone(float edge) {
  return smoothstep(uEdgeThreshold - uEdgeSoftness, uEdgeThreshold + uEdgeSoftness, edge);
}

vec4 oceanSurface(float tone, vec3 normal, vec3 position) {
  float safeMP = max(uMidPosition, 1e-4);
  float seg0   = clamp(tone / safeMP, 0.0, 1.0);
  float seg1   = clamp((tone - safeMP) / max(1.0 - safeMP, 1e-4), 0.0, 1.0);
  float inSeg1 = step(safeMP, tone);
  vec3 color   = mix(
    mix(uDeepColor, uMidColor, seg0),
    mix(uMidColor,  uHighlight, seg1),
    inSeg1
  );

  vec3 surfaceNormal       = normalize(normal);
  vec3 viewDir = normalize(cameraPosition - position);

  float nDotV  = clamp(dot(surfaceNormal, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - nDotV, uFresnelPower) * uFresnelStrength;
  color = mix(color, uHighlight, fresnel);

  vec3  sunDir = normalize(uSunDirection);
  vec3  halfVector      = normalize(sunDir + viewDir);
  float spec   = pow(max(dot(surfaceNormal, halfVector), 0.0), uSpecularPower) * uSpecularStrength;
  color = mix(color, uHighlight, spec);

  vec3  moonDir = normalize(uMoonDirection);
  vec3  moonHalfVector      = normalize(moonDir + viewDir);
  float moonSpec = pow(max(dot(surfaceNormal, moonHalfVector), 0.0), 64.0) * uMoonIntensity * 0.45;
  color = mix(color, vec3(0.72, 0.82, 1.0), clamp(moonSpec, 0.0, 1.0));

  return vec4(color, mix(uDeepOpacity, 1.0, max(tone, fresnel)) * uOpacity);
}

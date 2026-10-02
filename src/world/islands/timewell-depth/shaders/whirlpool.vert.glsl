uniform sampler2D uShoreField;
uniform float uIslandScale;
uniform float uFieldScale;
uniform vec2  uFieldOrigin;

varying vec2 vLocal;
varying vec2 vFieldUv;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vLocal = vec2(position.x, -position.z);
  vFieldUv = position.xz * uFieldScale + uFieldOrigin;

  float shoreGap = texture2D(uShoreField, vFieldUv).g * uIslandScale;
  float shoreHold = smoothstep(0.0, SHORE_BLEND, shoreGap);
  vec3 surface = vec3(position.x, position.y * shoreHold, position.z);

  float radius = length(position.xz);
  float slope = FUNNEL_DEPTH * FUNNEL_CURVE * pow(max(1.0 - radius, 0.0), FUNNEL_CURVE - 1.0);
  vec2 outward = radius > 1e-4 ? position.xz / radius : vec2(0.0);
  vec3 localNormal = vec3(-outward.x * slope * shoreHold, 1.0, -outward.y * slope * shoreHold);
  vWorldNormal = normalize(mat3(modelMatrix) * normalize(localNormal));

  vec4 worldPosition = modelMatrix * vec4(surface, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}

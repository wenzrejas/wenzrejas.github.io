uniform float uSize;

attribute float aBrightness;

varying float vBrightness;

void main() {
  vec4 world    = modelMatrix * vec4(position, 1.0);
  vec3 forward  = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0));
  vec3 toCamera = normalize(cameraPosition - world.xyz);

  vBrightness  = aBrightness * smoothstep(-0.3, 0.5, dot(forward, toCamera));
  gl_Position  = projectionMatrix * viewMatrix * world;
  gl_PointSize = uSize * aBrightness;
}

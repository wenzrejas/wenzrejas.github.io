attribute vec2 aFlow;

varying vec2 vFlowUv;
varying vec2 vFlow;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vFlowUv        = uv;
  vFlow          = aFlow;
  vWorldPosition = world.xyz;
  vWorldNormal   = normalize(mat3(modelMatrix) * normal);
  gl_Position    = projectionMatrix * viewMatrix * world;
}

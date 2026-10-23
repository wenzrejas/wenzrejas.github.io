uniform vec2 uSize;

varying vec2 vUv;

void main() {
  vec3 origin = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 across = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 upward = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vUv = position.xy;
  vec3 world = origin + across * position.x * uSize.x + upward * position.y * uSize.y;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}

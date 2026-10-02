uniform float uSize;

varying vec2 vUv;

void main() {
  vec3 origin   = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 camRight = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));

  vUv = position.xy + 0.5;

  vec3 world = origin
             + camRight * position.x * uSize
             + vec3(0.0, 1.0, 0.0) * vUv.y * uSize;

  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}

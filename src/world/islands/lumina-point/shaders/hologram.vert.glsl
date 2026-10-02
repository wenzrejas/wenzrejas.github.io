varying vec3  vViewNormal;
varying float vWorldY;
varying float vSeed;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);

  vViewNormal = normalize(normalMatrix * normal);
  vWorldY     = world.y;
  vSeed       = fract(dot(modelMatrix[3].xz, vec2(0.1731, 0.3197)));

  gl_Position = projectionMatrix * viewMatrix * world;
}

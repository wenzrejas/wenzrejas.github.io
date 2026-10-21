uniform float uSize;
uniform vec2  uDrift;

attribute float aLife;
attribute float aSize;
attribute float aSeed;

varying float vLife;
varying float vSeed;

void main() {
  float spread = 1.0 - (1.0 - aLife) * (1.0 - aLife);

  vec4 world = modelMatrix * vec4(position, 1.0);
  world.xz  += uDrift * pow(aLife, 1.5);

  gl_Position  = projectionMatrix * viewMatrix * world;
  gl_PointSize = aLife < 1.0 ? uSize * aSize * mix(1.0, GROWTH, spread) : 0.0;
  vLife = aLife;
  vSeed = aSeed;
}

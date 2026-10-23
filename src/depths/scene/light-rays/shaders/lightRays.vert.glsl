attribute vec2 shaft;
attribute float seed;

varying vec2 vShaft;
varying float vSeed;
varying float vDrop;

void main() {
  vShaft = shaft;
  vSeed = seed;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vDrop = TOP - world.y;
  gl_Position = projectionMatrix * viewMatrix * world;
}

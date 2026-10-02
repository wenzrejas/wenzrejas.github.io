uniform float uGlow[SITE_COUNT];

attribute vec2 aHaloUv;
attribute vec3 aColor;
attribute float aSite;

varying vec2 vHaloUv;
varying vec3 vColor;
varying float vGlow;

void main() {
  vHaloUv = aHaloUv;
  vColor = aColor;
  vGlow = uGlow[int(aSite)];
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

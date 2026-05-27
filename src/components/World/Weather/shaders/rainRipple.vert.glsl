attribute float aProgress; // 0=just spawned → 1=fully expanded (per instance)
attribute vec2  aCenter;   // world XZ spawn position (per instance)

varying float vProgress;
varying vec2  vUV;         // 0..1 across the quad face

void main() {
  vProgress = aProgress;

  // position.xz ranges -1..1 from the flat XZ quad
  vUV = position.xz * 0.5 + 0.5;

  // Scale quad from 0 → max radius as ring expands
  float radius = aProgress * 7.0;
  vec3 worldPos = vec3(
    aCenter.x + position.x * radius,
    0.15,
    aCenter.y + position.z * radius
  );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}

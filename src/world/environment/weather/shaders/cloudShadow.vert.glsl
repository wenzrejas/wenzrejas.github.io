  varying vec2 vCloudUv;
  void main() {
    vCloudUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }

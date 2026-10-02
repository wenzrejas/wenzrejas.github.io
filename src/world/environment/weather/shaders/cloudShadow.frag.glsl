  uniform sampler2D uMap;
  uniform vec2  uRepeat;
  uniform vec2  uOffset;
  uniform float uGain;
  uniform float uBias;
  uniform float uOpacity;
  uniform vec3  uColor;
  varying vec2  vCloudUv;

  void main() {
    float d = texture2D(uMap, vCloudUv * uRepeat + uOffset).a;
    float cloud = clamp(d * uGain + uBias, 0.0, 1.0);
    gl_FragColor = vec4(uColor, cloud * uOpacity);
  }

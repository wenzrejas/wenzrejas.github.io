uniform sampler2D uSnapshot;
uniform sampler2D uField;
uniform vec2  uFieldScale;
uniform float uFieldLowest;
uniform float uFieldSpan;
uniform float uFront;

varying vec2 vUv;

void main() {
  vec2  fieldUv = vec2(vUv.x, 1.0 - vUv.y) * uFieldScale;
  float value   = uFieldLowest + texture2D(uField, fieldUv).r * uFieldSpan;
  float cover   = smoothstep(uFront - DISSOLVE_SOFTNESS, uFront + DISSOLVE_SOFTNESS, value);
  if (cover <= 0.003) discard;

  vec4 parchment = texture2D(uSnapshot, vUv);
  gl_FragColor   = vec4(parchment.rgb, parchment.a * cover);
  #include <colorspace_fragment>
}

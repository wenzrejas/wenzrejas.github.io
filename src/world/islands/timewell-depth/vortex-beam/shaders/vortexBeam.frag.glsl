uniform vec3 uColor;
uniform float uSharpness;
uniform float uStrength;
uniform float uFlowRate;
uniform float uTime;
uniform float uGlow;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  float core = pow(abs(normalize(vNormal).z), uSharpness);
  float height = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(TOP_FADE, 1.0, vUv.y));
  float flow = 1.0 - FLOW_DEPTH + FLOW_DEPTH * sin((vUv.y * FLOW_DENSITY - uTime * uFlowRate) * 6.2832);
  float alpha = (core + core * core) * height * flow * uGlow * uStrength;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * core), alpha);
}

uniform vec3 uColor;
uniform float uGlow;
uniform float uTime;
uniform float uLength;

varying float vFacing;
varying float vHeight;

void main() {
  float core = pow(vFacing, CORE_SHARPNESS);
  float body = pow(vFacing, BODY_SHARPNESS) * BODY_STRENGTH;
  float haze = pow(vFacing, HAZE_SHARPNESS) * HAZE_STRENGTH;
  float flow = 1.0 - FLOW_DEPTH * (0.5 + 0.5 * sin(vHeight * FLOW_DENSITY - uTime * FLOW_SPEED));
  float tip = 1.0 - smoothstep(uLength * TIP_SHARE, uLength, vHeight);
  float alpha = (haze + body + core) * flow * tip * uGlow;
  if (alpha <= 0.003) discard;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), alpha);
}

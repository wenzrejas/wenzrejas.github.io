uniform float uTime;
uniform float uStrength;
varying float vAlong;
varying float vSeed;

void main() {
  float head = fract(uTime * SLIPSTREAM_SPEED + vSeed) * (1.0 + SLIPSTREAM_DASH);
  float dash = (vAlong - head + SLIPSTREAM_DASH) / SLIPSTREAM_DASH;
  float body = smoothstep(0.0, 0.4, dash) * smoothstep(1.0, 0.85, dash);
  float ends = smoothstep(0.0, 0.1, vAlong) * smoothstep(1.0, 0.92, vAlong);

  float alpha = body * ends * uStrength * SLIPSTREAM_OPACITY;
  if (alpha < 0.005) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}

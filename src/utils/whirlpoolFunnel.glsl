uniform vec4 uWhirlpool;
uniform vec2 uWhirlpoolShape;

float whirlpoolShare(vec2 point) {
  return length(point - uWhirlpool.xy) / max(uWhirlpool.z, 1e-3);
}

float whirlpoolDip(vec2 point) {
  return uWhirlpool.w * pow(max(1.0 - whirlpoolShare(point), 0.0), uWhirlpoolShape.x);
}

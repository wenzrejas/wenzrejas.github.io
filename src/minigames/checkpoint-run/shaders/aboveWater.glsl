float aboveWaterShare(float aboveWater) {
  float pixel = fwidth(aboveWater) + 1e-3;
  return smoothstep(0.0, pixel, aboveWater);
}

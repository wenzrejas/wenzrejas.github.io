#include "./waveSines.glsl"

#include "/shaders/quinticNoise.glsl"

float fbm(vec2 point) {
  float value = 0.0, amplitude = 0.5;
  mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    value += amplitude * vnoise(point);
    point  = rotation * point * 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec3 waveField(vec2 groundPoint) {
  float flowTime = uTime * uWaveSpeed;

  vec3 sines = waveSines(groundPoint);
  float y = sines.x, slopeX = sines.y, slopeZ = sines.z;

  float noiseScale  = 0.06;
  vec2  noiseOffset = vec2(flowTime * 0.08, flowTime * 0.05);
  float sampleGap  = 2.0;
  float noiseHere = fbm(groundPoint                      * noiseScale + noiseOffset);
  float noiseAheadX = fbm((groundPoint + vec2(sampleGap, 0.0))   * noiseScale + noiseOffset);
  float noiseAheadZ = fbm((groundPoint + vec2(0.0, sampleGap))   * noiseScale + noiseOffset);
  y    += (noiseHere - 0.5) * 0.6;
  slopeX += ((noiseAheadX - noiseHere) / sampleGap) * 0.6;
  slopeZ += ((noiseAheadZ - noiseHere) / sampleGap) * 0.6;

  float swellScale = 0.008, swellAmplitude = 0.9, swellGap = 6.0;
  vec2  swellOffset  = vec2(uTime * 0.016, uTime * 0.013);
  float swellHere    = fbm(groundPoint                       * swellScale + swellOffset);
  float swellAheadX    = fbm((groundPoint + vec2(swellGap, 0.0)) * swellScale + swellOffset);
  float swellAheadZ    = fbm((groundPoint + vec2(0.0, swellGap)) * swellScale + swellOffset);
  y    += (swellHere - 0.5) * swellAmplitude;
  slopeX += ((swellAheadX - swellHere) / swellGap) * swellAmplitude;
  slopeZ += ((swellAheadZ - swellHere) / swellGap) * swellAmplitude;

  return vec3(y, slopeX, slopeZ);
}

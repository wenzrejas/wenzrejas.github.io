uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveSpeed;
uniform float uWindAmplitude;
uniform sampler2D uShoreCalmMap;
uniform float uShoreCalmMapSize;

vec3 waveContrib(vec2 point, vec2 waveDirection, float frequency, float amplitude, float phase, float speed) {
  vec2 direction   = normalize(waveDirection);
  float arg = dot(point, direction) * frequency + uTime * speed + phase;
  float sine = sin(arg), cosine = cos(arg);
  return vec3(amplitude * sine, amplitude * cosine * frequency * direction.x, amplitude * cosine * frequency * direction.y);
}

vec3 waveSines(vec2 groundPoint) {
  float y = 0.0, slopeX = 0.0, slopeZ = 0.0;
  vec3 wave;

  wave = waveContrib(groundPoint, vec2(-0.97,  0.26), 0.08, 0.40 * uWindAmplitude, 0.00, 1.2 * uWaveSpeed); y += wave.x; slopeX += wave.y; slopeZ += wave.z;
  wave = waveContrib(groundPoint, vec2(-0.87,  0.50), 0.13, 0.25 * uWindAmplitude, 1.57, 0.8 * uWaveSpeed); y += wave.x; slopeX += wave.y; slopeZ += wave.z;
  wave = waveContrib(groundPoint, vec2(-0.97,  0.00), 0.22, 0.12 * uWindAmplitude, 3.14, 1.5 * uWaveSpeed); y += wave.x; slopeX += wave.y; slopeZ += wave.z;
  wave = waveContrib(groundPoint, vec2(-0.50,  0.87), 0.35, 0.08 * uWindAmplitude, 0.78, 2.0 * uWaveSpeed); y += wave.x; slopeX += wave.y; slopeZ += wave.z;
  wave = waveContrib(groundPoint, vec2(-0.26, -0.97), 0.50, 0.04 * uWindAmplitude, 2.30, 2.8 * uWaveSpeed); y += wave.x; slopeX += wave.y; slopeZ += wave.z;

  return vec3(y, slopeX, slopeZ);
}

float shoreCalm(vec2 groundPoint) {
  return texture2D(uShoreCalmMap, groundPoint / uShoreCalmMapSize + 0.5).r;
}

float waveRideAt(vec2 groundPoint) {
  return waveSines(groundPoint).x * shoreCalm(groundPoint);
}

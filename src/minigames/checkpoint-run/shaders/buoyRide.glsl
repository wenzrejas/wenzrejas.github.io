vec2 buoySpot = modelMatrix[3].xz;
vec3 buoyWave = waveSines(buoySpot) * shoreCalm(buoySpot);
vec2 buoySlope = buoyWave.yz * uWaveAmp * BUOY_WAVE_TILT;
vec3 buoyReach = transformed;
transformed.x -= buoySlope.x * buoyReach.y;
transformed.z -= buoySlope.y * buoyReach.y;
transformed.y += buoySlope.x * buoyReach.x + buoySlope.y * buoyReach.z + buoyWave.x * uWaveAmp;

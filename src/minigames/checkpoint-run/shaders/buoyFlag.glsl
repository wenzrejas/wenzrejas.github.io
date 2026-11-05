float flagAlong = transformed.x;
float flagFlap = sin(flagAlong * BUOY_FLAG_WAVES - uTime * BUOY_FLAG_RATE) * BUOY_FLAG_FLAP * flagAlong / BUOY_FLAG_SPAN;
float flagSide = transformed.z + flagFlap;
transformed.x = flagAlong * uFlagDir.x - flagSide * uFlagDir.y;
transformed.z = flagAlong * uFlagDir.y + flagSide * uFlagDir.x;

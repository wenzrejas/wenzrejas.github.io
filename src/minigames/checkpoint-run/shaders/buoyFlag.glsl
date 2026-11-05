float flagAlong = transformed.x;
float flagFlap = sin(flagAlong * BUOY_FLAG_WAVES - uTime * BUOY_FLAG_RATE) * BUOY_FLAG_FLAP * flagAlong / BUOY_FLAG_SPAN;
float flagSide = transformed.z + flagFlap;
transformed.x = flagAlong * uFlagDirection.x - flagSide * uFlagDirection.y;
transformed.z = flagAlong * uFlagDirection.y + flagSide * uFlagDirection.x;

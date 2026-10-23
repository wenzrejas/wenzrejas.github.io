float tailShare = smoothstep(TAIL_START, 1.0, -position.x);
transformed.z += sin(uSwimTime * TAIL_WIGGLE_RATE + swimSeed * 6.2832 + position.x * TAIL_WAVE) * TAIL_WIGGLE * tailShare;
transformed.x += mod(uSwimTime * swimLane.x + swimLane.y, swimLane.z) - swimLane.z * 0.5;
transformed.y += sin(uSwimTime * FISH_BOB_RATE + swimSeed * 6.2832) * FISH_BOB;

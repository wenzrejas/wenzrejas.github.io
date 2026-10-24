float stroke = uSwimTime * WHALE_STROKE_RATE;
float tailBend = clamp((WHALE_BEND_START - position.z) / WHALE_BEND_SPAN, 0.0, 1.0);
float headShare = clamp((position.z - WHALE_BEND_START) / (0.5 - WHALE_BEND_START), 0.0, 1.0);
transformed.y += sin(stroke - tailBend * WHALE_STROKE_LAG) * WHALE_STROKE_SWING * tailBend * tailBend;
transformed.y -= sin(stroke) * WHALE_HEAD_NOD * headShare;

float flipperStroke = uSwimTime * WHALE_FLIPPER_RATE;
transformed.z += flipperReach * sin(flipperStroke) * WHALE_FLIPPER_SWEEP;
transformed.y += flipperReach * cos(flipperStroke) * WHALE_FLIPPER_LIFT;
transformed.x += sign(position.x) * flipperReach * (0.5 + 0.5 * cos(flipperStroke)) * WHALE_FLIPPER_SPREAD;

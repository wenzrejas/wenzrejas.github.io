float comet = loopComet();
diffuseColor.rgb = mix(diffuseColor.rgb, uCometColor, comet * COMET_TINT);

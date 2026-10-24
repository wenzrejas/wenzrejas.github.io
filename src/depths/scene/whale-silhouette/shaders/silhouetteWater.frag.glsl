#ifdef USE_FOG
gl_FragColor.rgb = mix(silhouetteShade, fogColor, WHALE_WATER_SHARE);
#endif

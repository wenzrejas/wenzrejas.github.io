#ifdef USE_FOG
float hazeDepth = max(vFogDepth - KIT_HAZE_START, 0.0);
float haze = 1.0 - exp(-KIT_HAZE_DENSITY * KIT_HAZE_DENSITY * hazeDepth * hazeDepth);
gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, haze);
#endif

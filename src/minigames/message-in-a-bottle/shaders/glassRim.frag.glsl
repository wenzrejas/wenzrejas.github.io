float glassRim = 1.0 - abs(dot(normal, geometryViewDir));
gl_FragColor.a = mix(gl_FragColor.a, GLASS_RIM_OPACITY, pow(glassRim, GLASS_RIM_POWER));

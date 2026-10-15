vec3 bakedLighting = texture2D( aoMap, vAoMapUv ).rgb;
float overheadShade = 1.0 - uBakedShadowStrength * uOverheadShadow * ( 1.0 - bakedLighting.g );
reflectedLight.directDiffuse *= overheadShade;
reflectedLight.directSpecular *= overheadShade;

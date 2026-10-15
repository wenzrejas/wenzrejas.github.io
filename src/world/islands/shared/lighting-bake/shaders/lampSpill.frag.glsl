{
  float lampIrradiance = bakedLighting.b * bakedLighting.b;
  gl_FragColor.rgb += diffuseColor.rgb * uLampSpillLight * lampIrradiance * uLampSpill;
}

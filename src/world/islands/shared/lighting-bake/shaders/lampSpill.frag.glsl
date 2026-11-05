{
#ifdef LAMP_SPILL_RGB
  vec3 storedSpill = texture2D( uLampSpillMap, vAoMapUv ).rgb;
#else
  vec3 storedSpill = vec3( bakedLighting.b );
#endif
  float storedPeak = max( storedSpill.r, max( storedSpill.g, storedSpill.b ) );
  vec3 lampSpill = uLampSpillLight * storedSpill * storedPeak * uLampSpill;
#ifdef LAMP_SPILL_CEILING
  lampSpill = uLampSpillCeiling * ( 1.0 - exp( -lampSpill / uLampSpillCeiling ) );
#endif
  gl_FragColor.rgb += diffuseColor.rgb * lampSpill;
}

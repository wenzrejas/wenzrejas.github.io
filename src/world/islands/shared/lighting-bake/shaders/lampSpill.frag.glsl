{
#ifdef LAMP_SPILL_RGB
  vec3 storedSpill = texture2D( uLampSpillMap, vAoMapUv ).rgb;
#else
  vec3 storedSpill = vec3( bakedLighting.b );
#endif
  float storedPeak = max( storedSpill.r, max( storedSpill.g, storedSpill.b ) );
  gl_FragColor.rgb += diffuseColor.rgb * uLampSpillLight * storedSpill * storedPeak * uLampSpill;
}

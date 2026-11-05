{
  vec2 cloudUv = vec2(vCloudWorld.x + CLOUD_HALF_PLANE, CLOUD_HALF_PLANE - vCloudWorld.z) / uCloudTile + uCloudOffset;
  float density = texture2D(uCloudMap, cloudUv).a;
  float cloud = clamp(density * uCloudGain + uCloudBias, 0.0, 1.0) * uCloudStrength;
  gl_FragColor.rgb *= 1.0 - cloud * CLOUD_MODEL_SHADOW_DARK;
}

uniform float uSapphireGlow;

varying vec3 vFacetNormal;

float sapphireFacet() {
  vec3 light = normalize(vec3(FACET_LIGHT_X, FACET_LIGHT_Y, FACET_LIGHT_Z));
  float facing = 0.5 + 0.5 * dot(normalize(vFacetNormal), light);
  return mix(FACET_SHADE_FLOOR, 1.0, pow(facing, FACET_SHARPNESS));
}

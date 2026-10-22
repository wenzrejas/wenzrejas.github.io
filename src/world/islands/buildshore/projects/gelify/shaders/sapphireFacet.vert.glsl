vec3 facetReach = abs(objectNormal);
vec3 facetAxis = facetReach.x > facetReach.y && facetReach.x > facetReach.z
  ? vec3(sign(objectNormal.x), 0.0, 0.0)
  : facetReach.y > facetReach.z
    ? vec3(0.0, sign(objectNormal.y), 0.0)
    : vec3(0.0, 0.0, sign(objectNormal.z));
vec3 facetTilt = objectNormal - facetAxis * dot(objectNormal, facetAxis);
vFacetNormal = normalize(normalMatrix * normalize(facetAxis + facetTilt * FACET_TILT_GAIN));

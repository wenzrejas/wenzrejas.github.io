uniform sampler2DArray uLayerMaps;
uniform float uTime;
uniform float uAspect;
uniform float uLayerScales[CLOUD_LAYER_COUNT];
uniform float uLayerCoverages[CLOUD_LAYER_COUNT];
uniform float uLayerOpacities[CLOUD_LAYER_COUNT];
uniform float uLayerZooms[CLOUD_LAYER_COUNT];
uniform vec3  uLitColor;
uniform vec3  uShadeColor;

varying vec2 vUv;

vec4 cloudLayer(int layer, vec2 screen, float thinning, float centreness) {
  float zoom  = uLayerZooms[layer];
  vec2  seen  = screen / zoom + vec2(uTime * CLOUD_DRIFT / uLayerScales[layer], 0.0);
  vec2  uv    = (seen / vec2(uAspect, 1.0) + 0.5 + CLOUD_BAKE_MARGIN) / (1.0 + 2.0 * CLOUD_BAKE_MARGIN);
  vec2  baked = texture(uLayerMaps, vec3(uv, float(layer))).rg;

  float passage = smoothstep(PASS_FROM_ZOOM, PASS_TO_ZOOM, zoom);
  float edge    = uLayerCoverages[layer] + thinning + passage * (CLEAR_RISE + centreness * CENTER_CLEAR);
  float alpha   = smoothstep(edge, edge + CLOUD_SOFTNESS, baked.r) * uLayerOpacities[layer];
  return vec4(mix(uShadeColor, uLitColor, baked.g) * alpha, alpha);
}

void main() {
  vec2  screen     = (vUv - 0.5) * vec2(uAspect, 1.0);
  float outward    = length(screen);
  float centreness = 1.0 - smoothstep(0.0, CENTER_REACH, outward);
  float thinning   = SHIP_CLEARANCE * (1.0 - smoothstep(0.0, SHIP_CLEAR_REACH, outward));

  vec4 sky = vec4(0.0);
  for (int i = 0; i < CLOUD_LAYER_COUNT; i++) {
    vec4 layer = cloudLayer(i, screen, thinning, centreness);
    sky = layer + sky * (1.0 - layer.a);
  }
  if (sky.a <= 0.003) discard;

  gl_FragColor = vec4(sky.rgb / sky.a, sky.a);
  #include <colorspace_fragment>
}

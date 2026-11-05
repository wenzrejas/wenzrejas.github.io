uniform float uRadius;
uniform float uFalloff;
uniform vec3 uColor;
uniform vec3 uShade;
uniform vec3 uLit;
uniform sampler2D uCloudMap;
varying vec2 vWorldXZ;
varying vec4 vMistUv;
varying vec4 vLitUv;
varying float vLift;

float mound(vec4 uv) {
  float broad = texture2D(uCloudMap, uv.xy, FOG_DETAIL_BLUR).a;
  float fine = texture2D(uCloudMap, uv.zw, FOG_DETAIL_BLUR).a;
  return mix(broad, fine, FOG_FINE_SHARE);
}

void main() {
  float dist = length(vWorldXZ);
  float body = mound(vMistUv);
  float wobble = (body - 0.5) * uFalloff;

  float sheet = smoothstep(uRadius - uFalloff, uRadius, dist + wobble * FOG_SHEET_WARP);
  float rise = smoothstep(
    uRadius + uFalloff * FOG_RISE_START,
    uRadius + uFalloff * FOG_RISE_END,
    dist + wobble * FOG_RISE_WARP
  );
  float swell = FOG_SHEET_SWELL_BASE + FOG_SHEET_SWELL * body;
  float crest = mix(sheet * FOG_SHEET_LEVEL * swell, mix(FOG_VALLEY, 1.0, smoothstep(0.25, 0.75, body)), rise);
  float alpha = smoothstep(vLift, vLift + FOG_SOFT, crest);

  if (vLift == 0.0) {
    float hazeStart = uRadius - uFalloff * FOG_HAZE_REACH;
    float wispMask = smoothstep(hazeStart, uRadius - uFalloff * 0.6, dist);
    alpha = clamp(alpha + body * wispMask * FOG_HAZE, 0.0, 1.0);
  }

  if (alpha <= 0.0) discard;

  float tone = clamp(vLift + (body - mound(vLitUv)) * FOG_LIGHT_GAIN, 0.0, 1.0);
  vec3 color = tone < 0.5 ? mix(uShade, uColor, tone * 2.0) : mix(uColor, uLit, tone * 2.0 - 1.0);

  gl_FragColor = vec4(color, alpha);
}

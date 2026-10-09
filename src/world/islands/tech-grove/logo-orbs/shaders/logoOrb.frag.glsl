#include "/shaders/star.glsl"

uniform sampler2D uAtlas;
uniform vec4 uCell;
uniform vec3 uGlass;
uniform vec3 uLight;
uniform float uSeed;
uniform float uGlow;
uniform float uTime;
uniform float uOpacity;

varying vec2 vPoint;

float coverage(float distance) {
  float edge = fwidth(distance);
  return 1.0 - smoothstep(-edge, edge, distance);
}

vec4 over(vec4 below, vec3 color, float alpha) {
  return vec4(color * alpha, alpha) + below * (1.0 - alpha);
}

vec3 rainbow(float shift) {
  return 0.5 + 0.5 * cos(6.2832 * (shift + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 onSphere = vPoint * HALO_SPREAD;
  float fromCenter = length(onSphere);
  float inside = coverage(fromCenter - 1.0);
  vec3 normal = vec3(onSphere, sqrt(max(1.0 - fromCenter * fromCenter, 0.0)));
  float fresnel = pow(1.0 - normal.z, FRESNEL_POWER);
  float skyward = normal.y * 0.5 + 0.5;
  float swirl = atan(onSphere.y, onSphere.x) / 6.2832;
  vec3 film = rainbow(fresnel * FILM_BANDS + swirl + uTime * FILM_DRIFT);
  float pulse = 1.0 + PULSE_DEPTH * sin(uTime * PULSE_RATE + uSeed * 6.2832);

  float halo = 1.0 - smoothstep(1.0, HALO_SPREAD, fromCenter);
  vec3 haloColor = mix(uGlass, film, HALO_FILM);
  vec4 paint = vec4(haloColor * halo * halo * HALO_STRENGTH * uGlow * pulse, 0.0);

  float shade = mix(BODY_SHADE, 1.0, skyward);
  paint = over(paint, uGlass * shade, mix(BODY_OPACITY, RIM_OPACITY, fresnel) * inside);

  float caustic = 1.0 - smoothstep(0.0, CAUSTIC_SPREAD, length(onSphere + uLight.xy * CAUSTIC_OFFSET));
  paint.rgb += vec3(caustic * caustic * CAUSTIC_STRENGTH * inside);

  vec2 logoPoint = onSphere / (LOGO_SHARE * mix(1.0, LENS_ZOOM, normal.z));
  vec2 logoUv = uCell.xy + clamp(logoPoint * 0.5 + 0.5, 0.0, 1.0) * uCell.zw;
  float backlight = min(texture2D(uAtlas, logoUv, BACKLIGHT_BLUR).a * BACKLIGHT_SPREAD, 1.0);
  paint = over(paint, vec3(1.0), backlight * BACKLIGHT_OPACITY * inside);
  vec4 logo = texture2D(uAtlas, logoUv);
  paint = logo + paint * (1.0 - logo.a);

  vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float facing = max(dot(normal, halfway), 0.0);
  float glint = smoothstep(GLINT_START, 1.0, facing);
  float sheen = pow(facing, SHEEN_POWER) * SHEEN_STRENGTH;
  paint.rgb += (film * fresnel * FILM_STRENGTH * pulse + glint + sheen + fresnel * RIM_LIGHT * skyward) * inside;

  float twinkleCycle = uTime / TWINKLE_PERIOD + uSeed;
  float spot = (uSeed + floor(twinkleCycle) * 0.618034) * 6.2832;
  vec2 twinkleAt = vec2(cos(spot), sin(spot)) * TWINKLE_RIM;
  paint.rgb += vec3(star((onSphere - twinkleAt) / TWINKLE_SIZE) * starFlash(twinkleCycle, TWINKLE_SHARE) * TWINKLE_STRENGTH);

  gl_FragColor = paint * uOpacity;
}

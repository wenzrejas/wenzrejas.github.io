#include "/shaders/noise.glsl"
#include "/shaders/foam.glsl"
#include "/world/environment/ocean/shaders/oceanSurface.glsl"

uniform float uTime;
uniform sampler2D uShoreField;
uniform float uIslandScale;
uniform float uFieldTexel;
uniform float uFieldUvPerWorld;
uniform float uSmoothness;
uniform float uCellSpeed;
uniform vec3  uBackground;
uniform vec3  uFoamColor;
uniform vec3  uGlowColor;
uniform vec3  uMagicColor;
uniform float uNight;
uniform float uMagic;
uniform vec3  uAwakenColor;
uniform float uWaterGlow;
uniform float uSpiralGlow;
uniform float uRipple;
uniform float uRippleGlow;

varying vec2 vLocal;
varying vec2 vFieldUv;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

const float TAU = 6.28318530718;

float latticeHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

float swirlNoise(float turn, float along, float cells) {
  vec2 p = vec2(turn * cells, along);
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float left = mod(cell.x, cells);
  float right = mod(cell.x + 1.0, cells);
  return mix(
    mix(latticeHash(vec2(left, cell.y)), latticeHash(vec2(right, cell.y)), f.x),
    mix(latticeHash(vec2(left, cell.y + 1.0)), latticeHash(vec2(right, cell.y + 1.0)), f.x),
    f.y
  );
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k / 6.0;
}

vec3 swirlCells(vec2 p, float cellsAround) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float nearest = 8.0;
  float second = 8.0;
  float blended = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 id = vec2(mod(cell.x + offset.x, cellsAround), cell.y + offset.y);
      vec2 seed = vec2(latticeHash(id), latticeHash(id + 17.3));
      vec2 drift = 0.5 + 0.5 * sin(uTime * uCellSpeed + TAU * seed);
      float reach = length(offset + drift - f);
      second = min(second, max(nearest, reach));
      nearest = min(nearest, reach);
      blended = smin(blended, reach, uSmoothness);
    }
  }
  return vec3(nearest, second, blended);
}

float resolvable(float cells, float pixelTurn) {
  return 1.0 - smoothstep(0.2, 0.45, cells * pixelTurn);
}

float shoreGapAt(vec2 uv) {
  return texture2D(uShoreField, uv).r * uIslandScale;
}

vec2 awayFromShore(vec2 uv) {
  vec2 acrossX = vec2(uFieldTexel, 0.0);
  vec2 acrossZ = vec2(0.0, uFieldTexel);
  vec2 slope = vec2(
    texture2D(uShoreField, uv + acrossX).g - texture2D(uShoreField, uv - acrossX).g,
    texture2D(uShoreField, uv + acrossZ).g - texture2D(uShoreField, uv - acrossZ).g
  );
  float steepness = length(slope);
  return steepness > 1e-6 ? vec2(slope.x, -slope.y) / steepness : vec2(0.0);
}

float streakLayers(float turn, float flow, float cells) {
  return 0.65 * swirlNoise(turn, flow * 0.35, cells)
       + 0.35 * swirlNoise(turn, flow * 0.7 + 2.1, cells * 2.0);
}

float swirlStreaks(float turn, float flow, float level) {
  float octave = floor(level);
  float coarse = max(floor(STREAK_CELLS * exp2(octave) + 0.5), 1.0);
  float fine = max(floor(STREAK_CELLS * exp2(octave + 1.0) + 0.5), 1.0);
  return mix(streakLayers(turn, flow, coarse), streakLayers(turn, flow, fine), level - octave);
}

float coverage(float value, float cut) {
  float pixel = fwidth(value) + 1e-3;
  return smoothstep(cut - pixel, cut + pixel, value);
}

float stroke(float offset, float halfWidth, float pixelWidth) {
  float drawnHalfWidth = max(halfWidth, max(pixelWidth * 0.5, 1e-4));
  float edge = pixelWidth * 0.5;
  float covered = 1.0 - smoothstep(drawnHalfWidth - edge, drawnHalfWidth + edge, abs(offset));
  return covered * halfWidth / drawnHalfWidth;
}

vec3 magicTone(float radius) {
  return mix(uGlowColor, uMagicColor, smoothstep(0.15, 0.85, radius));
}

float rippleRing(float radius, float phase) {
  float progress = fract(phase);
  float front = 1.0 - (1.0 - progress) * (1.0 - progress);
  float offset = (radius - front) / RIPPLE_WIDTH;
  return exp(-offset * offset) * (1.0 - progress);
}

float lightStreaks(float warpedTurn, float flow, float radius, float pixelTurn) {
  float phase = warpedTurn * LIGHT_STREAKS;
  float lane = floor(phase + 0.5);
  float seed = mod(lane, LIGHT_STREAKS);
  float along = flow * LIGHT_DASH_DENSITY + uTime * LIGHT_RUSH + latticeHash(vec2(seed, 5.1)) * 9.0;
  float comet = fract(along);
  float lit = step(1.0 - LIGHT_SHARE, latticeHash(vec2(floor(along), seed + 2.7)));
  float body = smoothstep(0.0, 0.04, comet) * (1.0 - smoothstep(0.0, LIGHT_TAIL, comet)) * lit;

  float offset = phase - lane;
  float line = stroke(offset, LIGHT_WIDTH * (0.4 + 0.6 * body), LIGHT_STREAKS * pixelTurn);
  float bloom = exp(-pow(offset / (LIGHT_WIDTH * 4.0), 2.0)) * 0.35;
  float reach = smoothstep(0.04, 0.15, radius) * (1.0 - smoothstep(0.85, 1.0, radius));
  return (line + bloom) * body * reach;
}

void main() {
  vec2 pixelStepX = dFdx(vLocal);
  vec2 pixelStepY = dFdy(vLocal);

  float radius = length(vLocal);
  if (radius >= 1.0) discard;

  float shoreGap = shoreGapAt(vFieldUv);
  vec2 away = awayFromShore(vFieldUv);

  float swirlRadius = max(radius, 1e-3);
  vec2 flowDirection = normalize(TWIST * vec2(-vLocal.y, vLocal.x) - vLocal);

  float turn = (atan(vLocal.y, vLocal.x) + TWIST * log(swirlRadius)) / TAU;
  vec2 turnGradient =
    (vec2(-vLocal.y, vLocal.x) + TWIST * vLocal) / (max(radius * radius, 1e-6) * TAU);
  float pixelTurn = abs(dot(turnGradient, pixelStepX)) + abs(dot(turnGradient, pixelStepY));

  float flow = sqrt(swirlRadius) * FLOW_DENSITY + uTime * FLOW_SPEED;
  float warpedTurn = turn + (swirlNoise(turn, flow * 0.5, WARP_CELLS) - 0.5) * WARP / ARMS;

  float armPhase = fract(warpedTurn * ARMS);
  float crest = smoothstep(0.0, ARM_CREST, armPhase) * (1.0 - smoothstep(ARM_CREST, 1.0, armPhase));

  vec3 waterCells = swirlCells(vec2(warpedTurn * CELLS_AROUND, flow * CELL_STRETCH), CELLS_AROUND);
  float edge = mix(uEdgeThreshold, waterCells.x - waterCells.z, resolvable(CELLS_AROUND, pixelTurn));
  vec4 surface = oceanSurface(oceanTone(edge), vWorldNormal, vWorldPosition);
  vec3 water = mix(uBackground, surface.rgb, surface.a);

  water *= 1.0 + (crest * 2.0 - 1.0) * ARM_CONTRAST * resolvable(ARMS, pixelTurn);
  water *= mix(CORE_SHADE, 1.0, smoothstep(0.0, DEPTH_REACH, radius));

  float shimmer = (0.5 + 0.5 * sin(uTime * MAGIC_SHIFT_SPEED)) * MAGIC_SHIFT * uNight;
  vec3 coreColor = mix(mix(uGlowColor, uMagicColor, shimmer), uAwakenColor, uSpiralGlow * CORE_SHIFT);

  float halo = exp(-(radius * radius) / (HALO_RADIUS * HALO_RADIUS)) * HALO_STRENGTH;
  halo *= 1.0 + MAGIC_HALO_BOOST * uMagic;
  water = mix(water, coreColor, clamp(halo * (0.3 + 0.7 * crest), 0.0, 1.0));

  vec2 surfacePoint = vFieldUv / uFieldUvPerWorld;
  float jag = foamJag(surfacePoint * FOAM_GRAIN, uTime);

  float rimThinning = 1.0 - smoothstep(FOAM_THIN_START, 1.0, radius);

  float impact = clamp(dot(flowDirection, -away), 0.0, 1.0);
  float collarEdge = mix(COLLAR_LEE, COLLAR_IMPACT, impact) - jag * FOAM_JAG;
  float collar = 1.0 - coverage(shoreGap, collarEdge * rimThinning);

  vec2 downstream = vec2(flowDirection.x, -flowDirection.y);
  float wakeGap = shoreGapAt(vFieldUv - downstream * WAKE_LENGTH * uFieldUvPerWorld);
  float patchZone = max(
    1.0 - smoothstep(collarEdge, collarEdge + PATCH_REACH, shoreGap),
    (1.0 - smoothstep(0.0, PATCH_REACH, wakeGap)) * WAKE_STRENGTH
  ) * rimThinning;
  float patchNoise = swirlNoise(warpedTurn, flow * 2.4 + 7.3, PATCH_CELLS);
  float patches = coverage(patchNoise, 1.0 - patchZone) * step(0.01, patchZone);

  float streakLevel = clamp(log2(swirlRadius / STREAK_COARSEN_RADIUS), -3.0, 0.0);
  float streakNoise = swirlStreaks(warpedTurn, flow, streakLevel);
  float foamCover =
    (BASE_FOAM + crest * CREST_FOAM) * smoothstep(0.03, 0.12, radius) * rimThinning;
  float streaks = coverage(streakNoise + jag * 0.08, 1.0 - foamCover);
  streaks *= resolvable(STREAK_CELLS * exp2(streakLevel) * 2.0, pixelTurn);

  vec2 holePoint = vec2(warpedTurn * HOLE_CELLS, flow * CELL_STRETCH * 2.0);
  vec2 holeWobble = vec2(
    swirlNoise(warpedTurn, holePoint.y * 0.8, HOLE_CELLS),
    swirlNoise(warpedTurn + 0.5, holePoint.y * 0.8 + 3.7, HOLE_CELLS)
  ) - 0.5;
  float holeReach = swirlCells(holePoint + holeWobble * HOLE_WOBBLE, HOLE_CELLS).x;
  float hole = 1.0 - coverage(holeReach, HOLE_SIZE);
  hole *= smoothstep(collarEdge * 0.5, collarEdge, shoreGap) * resolvable(HOLE_CELLS, pixelTurn);

  float foam = max(max(collar, patches), streaks) * (1.0 - hole);

  vec2 fleckPoint = holePoint * FLECK_DENSITY;
  vec2 fleckCell = vec2(mod(floor(fleckPoint.x), HOLE_CELLS * FLECK_DENSITY), floor(fleckPoint.y));
  vec2 fleckCenter =
    floor(fleckPoint) + 0.25 + 0.5 * vec2(latticeHash(fleckCell + 3.1), latticeHash(fleckCell + 7.7));
  float fleck = 1.0 - smoothstep(FLECK_SIZE * 0.5, FLECK_SIZE, length(fleckPoint - fleckCenter));
  fleck *= step(0.5, latticeHash(fleckCell + 1.9)) * smoothstep(0.05, 0.35, max(patchZone, foamCover));
  fleck *= resolvable(HOLE_CELLS * FLECK_DENSITY, pixelTurn);

  vec3 foamTint = mix(uFoamColor, coreColor, clamp(halo * 2.0, 0.0, 1.0));
  foamTint = mix(foamTint, magicTone(radius), uNight * FOAM_GLOW);
  float foamShare = max(foam, fleck) * FOAM_OPACITY;
  vec3 color = mix(water, foamTint, foamShare);

  float streamLevel = max(uNight, uSpiralGlow * SPIRAL_STREAKS);
  if (streamLevel > 0.0) {
    float light = lightStreaks(warpedTurn, flow, radius, pixelTurn) * LIGHT_STRENGTH * streamLevel;
    color += mix(magicTone(radius), uAwakenColor, uSpiralGlow) * light;
  }

  if (uWaterGlow + uSpiralGlow + uRippleGlow > 0.0) {
    float awakenReach = 1.0 - smoothstep(WATER_GLOW_REACH, 1.0, radius);
    float trailingRing = rippleRing(radius, uRipple - RIPPLE_TRAIL) * step(RIPPLE_TRAIL, uRipple);
    float ripple = (rippleRing(radius, uRipple) + RIPPLE_ECHO * trailingRing) * uRippleGlow;
    float armOffset = (armPhase - ARM_CREST) / SPIRAL_WIDTH;
    float armLine = exp(-armOffset * armOffset) * resolvable(ARMS, pixelTurn);
    float awakenLight = WATER_GLOW * uWaterGlow * awakenReach + ripple * RIPPLE_GLOW;
    awakenLight += armLine * SPIRAL_GLOW * uSpiralGlow * awakenReach * smoothstep(0.05, 0.2, radius);
    color += uAwakenColor * awakenLight;
  }

  float pulse = 1.0 + GLOW_PULSE * sin(uTime * GLOW_PULSE_SPEED);
  float glow = exp(-(radius * radius) / (GLOW_RADIUS * GLOW_RADIUS));
  glow *= GLOW_STRENGTH * pulse * (1.0 + MAGIC_GLOW_BOOST * uMagic) * (1.0 + CORE_BOOST * uSpiralGlow);
  color = mix(color, coreColor, clamp(glow, 0.0, 1.0));
  float bloomReach = GLOW_RADIUS * 3.0;
  color += coreColor * exp(-(radius * radius) / (bloomReach * bloomReach)) * pulse * 0.4 * uMagic;
  color = mix(color, vec3(1.0), 1.0 - smoothstep(0.0, GLOW_RADIUS * 0.45, radius));

  float waterAlpha = 1.0 - smoothstep(FADE_START, 1.0, radius);
  float alpha = waterAlpha + foamShare * (1.0 - waterAlpha);
  gl_FragColor = vec4(mix(foamTint, color, waterAlpha / max(alpha, 1e-4)), alpha);
}

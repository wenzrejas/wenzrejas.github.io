#include "/shaders/noise.glsl"

uniform vec3 uBodyColor;
uniform vec3 uEdgeColor;
uniform vec3 uColumnColor;
uniform vec3 uSurfaceColor;
uniform float uColumnLevel;
uniform float uSurfaceLevel;
uniform float uAspect;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 centered = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
  float vignette = smoothstep(VIGNETTE_INNER, VIGNETTE_OUTER, length(centered));
  vec3 water = mix(uBodyColor, uEdgeColor, vignette);

  float shimmer = 1.0 + SHIMMER * sin(centered.x * 7.0 + uTime * SHIMMER_RATE)
    * sin(vUv.y * 5.0 - uTime * SHIMMER_RATE * 0.7);
  float column = exp(-pow(centered.x / COLUMN_WIDTH, 2.0)) * (0.55 + 0.45 * vUv.y) * shimmer;
  water += uColumnColor * column * uColumnLevel;
  water += uSurfaceColor * exp(-(1.0 - vUv.y) * SURFACE_FALLOFF) * uSurfaceLevel;

  water += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(water, 1.0);
}

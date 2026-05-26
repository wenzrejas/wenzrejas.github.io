import { GLSL_NOISE } from '../../../../utils/noise.glsl'

export const FOAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const FOAM_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uFoamBound;
  uniform float uHullAspect;
  varying vec2  vUv;

  ${GLSL_NOISE}

  void main() {
    vec2 c = vUv - 0.5;

    float ny = c.y / (uFoamBound * uHullAspect); // +1 = bow, -1 = stern
    float nx = c.x / uFoamBound;
    float ax = abs(nx);
    float ay = abs(ny);

    // Bow: tapered + superellipse p=3
    float bowProgress   = clamp(ny, 0.0, 1.0);
    float bowWidthScale = max(1.0 - bowProgress * 0.5, 0.02);
    float bx = ax / bowWidthScale;
    float by = ay * 1.2;
    float bowDist = pow(bx*bx*bx + by*by*by, 0.333);

    // Stern: flat transom
    float sternSide = clamp(-ny, 0.0, 1.0);
    float sternBeam  = max(1.0 - pow(sternSide, 3.0) * 0.3, 0.05);
    float sternDist  = max(ax / sternBeam, ay * 1.0);

    // Blend bow/stern
    float bowBlend = clamp(ny * 2.0, 0.0, 1.0);
    float hullDist = mix(sternDist, bowDist, bowBlend);

    float n  = noise(c * 11.0 + vec2(uTime * 0.11, -uTime * 0.09));
    float nq = floor(n * 6.0) / 6.0;
    float jag = hullDist + (nq - 0.40) * 0.20;

    if (jag > 1.0) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.70);
  }
`

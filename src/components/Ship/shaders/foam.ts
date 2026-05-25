export const FOAM_VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const FOAM_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uFoamBound;
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),             hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }

  void main() {
    vec2  c = vUv - 0.5;

    float bx = abs(c.x) / uFoamBound;
    float by = abs(c.y) / uFoamBound;
    float boxDist = max(bx, by);

    // Blocky quantised noise → jagged pixel-art edge
    float n  = noise(c * 11.0 + vec2(uTime * 0.11, -uTime * 0.09));
    float nq = floor(n * 6.0) / 6.0;
    float jag = boxDist + (nq - 0.40) * 0.20;

    if (jag > 1.0) discard;

    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.70);
  }
`

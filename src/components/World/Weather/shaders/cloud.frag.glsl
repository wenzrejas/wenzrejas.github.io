uniform float uCover;
uniform vec2  uOffset;
uniform float uTime;

varying vec2 vWorldPos;
varying vec2 vLocalPos;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 gradVec(vec2 p) {
  float h = hash(p) * 6.28318;
  return vec2(cos(h), sin(h));
}

// Perlin gradient noise — no grid artifacts, smooth in all directions
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(gradVec(i),            f           ),
        dot(gradVec(i+vec2(1,0)),  f-vec2(1,0) ), u.x),
    mix(dot(gradVec(i+vec2(0,1)),  f-vec2(0,1) ),
        dot(gradVec(i+vec2(1,1)),  f-vec2(1,1) ), u.x),
    u.y
  ) * 0.5 + 0.5;
}

const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);

// 3 octaves — fewer octaves = rounder blobs with softer, smoother edges
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * gnoise(p);
    p  = ROT * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vWorldPos * 0.006 + uOffset;

  float t  = uTime * 0.018;
  float wx = gnoise(uv * 1.6 + vec2(4.2 + t,       1.9          )) * 0.38;
  float wz = gnoise(uv * 1.6 + vec2(9.7,            6.4 + t*0.65 )) * 0.38;
  float n  = fbm(uv + vec2(wx, wz));

  float threshold = mix(0.72, 0.26, uCover);
  float softness  = 0.22;
  float cloud     = smoothstep(threshold - softness, threshold + softness, n);

  // Edge fade — drives alpha to 0 so the plane boundary is physically transparent
  float maxDist  = max(abs(vLocalPos.x), abs(vLocalPos.y));
  float edgeFade = 1.0 - smoothstep(650.0, 1450.0, maxDist);

  float darkness = mix(0.12, 0.50, uCover);
  float alpha    = cloud * darkness * edgeFade;

  if (alpha < 0.002) discard;

  // Black overlay with alpha — equivalent to multiply, but alpha=0 at edges = no seam
  gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
}

uniform bool uIsLiveried;
uniform vec3 uLiveryCloth;
uniform vec3 uLiveryAccent;

vec3 liveryColor(vec3 canvas) {
  if (canvas.r - canvas.g > LIVERY_ACCENT_REDNESS)
    return uLiveryAccent * (canvas.r / LIVERY_ACCENT_REFERENCE);
#ifndef LIVERY_ACCENT_ONLY
  if (min(canvas.g, canvas.b) > LIVERY_CLOTH_WHITENESS)
    return uLiveryCloth * (canvas.g / LIVERY_CLOTH_REFERENCE);
#endif
  return canvas;
}

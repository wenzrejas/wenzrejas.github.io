vec3 splashDrift(vec3 origin, vec3 velocity, float age, float riseSpeed) {
  float slowed = (1.0 - exp(-DRAG * age)) / DRAG;
  float buoyed = age - (1.0 - exp(-RISE_ONSET * age)) / RISE_ONSET;
  return origin + velocity * slowed + vec3(0.0, riseSpeed * buoyed, 0.0);
}

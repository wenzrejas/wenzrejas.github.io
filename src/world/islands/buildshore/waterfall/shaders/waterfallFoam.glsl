uniform sampler2D uCellMap;

float cellDistance(vec2 p) {
  return texture2D(uCellMap, p / CELL_TEXTURE_CELLS).r * CELL_TEXTURE_RANGE;
}

float foamCells(vec2 uv, vec2 flow, float seed) {
  return min(
    cellDistance((uv + flow) * FOAM_SCALE_A + seed * 17.0),
    cellDistance((uv + flow * FOAM_PACE_B) * FOAM_SCALE_B + seed * 31.0)
  );
}

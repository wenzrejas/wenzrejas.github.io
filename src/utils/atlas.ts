interface AtlasRect {
  width: number
  height: number
  atlasX: number
  atlasY: number
}

export const atlasSpriteStyle = (
  atlasWidth: number,
  atlasHeight: number,
  piece: AtlasRect,
  scaleX: number,
  scaleY: number
) => ({
  width: piece.width * scaleX,
  height: piece.height * scaleY,
  backgroundSize: `${atlasWidth * scaleX}px ${atlasHeight * scaleY}px`,
  backgroundPosition: `${-piece.atlasX * scaleX}px ${-piece.atlasY * scaleY}px`,
})

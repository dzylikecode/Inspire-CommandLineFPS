// Incrementally cast ray from player, along ray angle, testing for
// intersection with a block
export function emitRay(camera, emitDir, map) {
  const stepSize = 0.1; // Increment size for ray casting, decrease to increase
  let distanceToWall = 0.0;
  let stopMsg = "";
  let rayX = 0;
  let rayY = 0;
  while (1) {
    distanceToWall += stepSize;
    rayX = camera.x + emitDir.x * distanceToWall;
    rayY = camera.y + emitDir.y * distanceToWall;
    if (distanceToWall > camera.depth) {
      stopMsg = "OutOfDepth";
      distanceToWall = camera.depth;
      break;
    } else if (map.isOutOfBounds(rayX, rayY)) {
      stopMsg = "OutOfBound";
      break;
    } else if (map.isWall(rayX, rayY)) {
      stopMsg = "HitWall";
      break;
    }
  }
  return {
    stopMsg: stopMsg,
    ray: { x: rayX, y: rayY },
    distanceToWall: distanceToWall,
  };
}

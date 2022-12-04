/**
 * - target
 *
 *   希望像解决数学题目一样分步骤写
 *
 *
 * - 问题的概述
 *
 *   link: https://dzylikecode.github.io/Inspire-CommandLineFPS/#/docs/lib/checkRayHitWallBound.md
 *
 */

/**
 * 将player的位置映射到角落分布
 * @param {number} pos
 * @param {number} cornerPos
 * @returns
 */
function mapPosToCornerDistribution(pos, cornerPos) {
  if (pos < cornerPos) return 0;
  else if (pos === cornerPos) return 1;
  else return 2;
}

const corner = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

const visibleCornerDistribution = [
  [
    [0, 1, 3],
    [0, 1],
    [0, 1, 2],
  ],
  [[0, 3], [-1], [1, 2]],
  [
    [0, 2, 3],
    [2, 3],
    [1, 2, 3],
  ],
];

export function checkRayHitWallBound(rayToViewPos, wallPos, viewPos, hitTheta) {
  const [distriX, distriY] = [
    mapPosToCornerDistribution(viewPos.x, wallPos.x),
    mapPosToCornerDistribution(viewPos.y, wallPos.y),
  ];

  const visibleCorner = visibleCornerDistribution[distriX][distriY].map(
    (index) => corner[index]
  );

  const thetaVisibleCornerToRay = visibleCorner.map(([cx, cy]) => {
    const wallToViewX = wallPos.x + cx - viewPos.x;
    const wallToViewY = wallPos.y + cy - viewPos.y;
    const length = Math.sqrt(
      // Distance from ray to player
      wallToViewX * wallToViewX + wallToViewY * wallToViewY
    );
    const cosTheta =
      (wallToViewX * rayToViewPos.x + wallToViewY * rayToViewPos.y) / length;
    return Math.acos(cosTheta);
  });

  // When ray is this close to a boundary, consider it as intersecting
  return thetaVisibleCornerToRay.some(
    // If ray is close to any of the tile's corners
    (theta) => theta < hitTheta
  );
}

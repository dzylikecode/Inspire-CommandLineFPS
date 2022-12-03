/**
 * - target
 *
 *   希望像解决数学题目一样分步骤写
 *
 *
 * - 问题的概述
 *
 *   link:
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

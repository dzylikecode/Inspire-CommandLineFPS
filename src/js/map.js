// Create Map of world space # = wall block, . = space
const src = [
  "#########.......",
  "#...............",
  "#.......########",
  "#..............#",
  "#......##......#",
  "#......##......#",
  "#..............#",
  "###............#",
  "##.............#",
  "#......####..###",
  "#......#.......#",
  "#......#.......#",
  "#..............#",
  "#......#########",
  "#..............#",
  "################",
];
const width = src[0].length; // 16 World Dimensions
const height = src.length; // 16

// 注意坐标系
function isWall(x, y) {
  const [intX, intY] = transCartesianToScreen(Math.floor(x), Math.floor(y));
  return src[intY][intX] === "#";
}

function isOutOfBounds(x, y) {
  return x < 0 || x >= width || y < 0 || y >= height;
}

function transCartesianToScreen(x, y) {
  return [x, height - 1 - y];
}

export default {
  src,
  width,
  height,
  isWall,
  isOutOfBounds,
  transCartesianToScreen,
};

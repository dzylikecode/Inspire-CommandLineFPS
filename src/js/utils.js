export class Clock {
  constructor() {
    this.lastTime = 0;
    this.deltaTime = 0;
  }
  tick() {
    let time = performance.now();
    this.deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    return this.deltaTime;
  }
  getDelta() {
    return this.deltaTime;
  }
}

function formatNumber(number, padNum, pad, decimal) {
  const numberWithDecimal = number.toFixed(decimal);
  return String(numberWithDecimal).padStart(padNum, pad);
}
function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

function normalizeAngle(degree) {
  if (degree < 0) normalizeAngle(degree + 360);
  else if (degree > 360) normalizeAngle(degree - 360);
  else return degree;
}

export function normalizeRadians(radians) {
  if (radians < 0) normalizeRadians(radians + 2 * Math.PI);
  else if (radians > 2 * Math.PI) normalizeRadians(radians - 2 * Math.PI);
  else return radians;
}

export const format3d2 = (number) => formatNumber(number, 3, " ", 2);
export const formatRad = (number) =>
  format3d2(normalizeAngle(radiansToDegrees(number)));

// export function Range(start, end) {
//   this.start = start;
//   this.end = end;
//   this.map = (fn) => {
//     let arr = [];
//     for (let i = this.start; i < this.end; i++) {
//       arr.push(fn(i));
//     }
//     return arr;
//   };
//   this.of = (start, end) => {
//     return new Range(start, end);
//   };
// }

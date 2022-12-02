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

export function Range(start, end) {
  this.start = start;
  this.end = end;
  this.map = (fn) => {
    let arr = [];
    for (let i = this.start; i < this.end; i++) {
      arr.push(fn(i));
    }
    return arr;
  };
  this.of = (start, end) => {
    return new Range(start, end);
  };
}

import map from "./map.js";

export class Player {
  constructor(x, y, theta, v, omega) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.v = v;
    this.omega = omega;
  }
  rotateLeft(deltaTime) {
    this.theta -= this.omega * deltaTime;
  }
  rotateRight(deltaTime) {
    this.theta += this.omega * deltaTime;
  }
  moveForward(deltaTime) {
    const pretendX = this.x + this.v * Math.cos(this.theta) * deltaTime;
    const pretendY = this.y + this.v * Math.sin(this.theta) * deltaTime;
    if (!map.isWall(pretendX, pretendY)) {
      this.x = pretendX;
      this.y = pretendY;
    }
  }
  moveBackward(deltaTime) {
    const pretendX = this.x - this.v * Math.cos(this.theta) * deltaTime;
    const pretendY = this.y - this.v * Math.sin(this.theta) * deltaTime;
    if (!map.isWall(pretendX, pretendY)) {
      this.x = pretendX;
      this.y = pretendY;
    }
  }
}

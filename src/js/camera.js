export class Camera {
  constructor(width, height, fov, depth) {
    this.width = width;
    this.height = height;
    this.fov = fov;
    this.depth = depth;
  }

  attachTo(obj) {
    this.obj = obj;
  }

  get x() {
    return this.obj.x;
  }

  get y() {
    return this.obj.y;
  }
}

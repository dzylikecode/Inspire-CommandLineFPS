export class Screen {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = create2D(width, height);
    return;
    function create2D(width, height) {
      let arr = new Array(width);
      return arr.map(() => new Array(height));
    }
  }
}
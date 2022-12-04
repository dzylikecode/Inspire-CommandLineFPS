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
  setInCartesian(x, y, value) {
    const [screenX, screenY] = transCartesianToScreen(x, y, this);
    this.setInScreen(screenX, screenY, value);
  }
  setInScreen(x, y, value) {
    this.buffer[x][y] = value;
  }
}

function transCartesianToScreen(x, y, screen) {
  return [x, screen.height - y];
}

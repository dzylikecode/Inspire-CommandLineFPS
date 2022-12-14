import { gameLoop } from "./gameFrame.js";

const term = $("body").terminal(
  {},
  {
    greetings: "W to move up, S to move down, A to move left, D to move right",
  }
);
let screenBuffer = [""];
let screenInfo = "";

class BarAnimation extends $.terminal.Animation {
  constructor(...args) {
    super(...args);
  }
  render(term) {
    gameLoop();
    return screenBuffer;
  }
}
term.echo(new BarAnimation(50));

export class Screen {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = create2D(width, height);
    return;
    function create2D(width, height) {
      let arr = new Array(height);
      // return arr.map(() => new Array(height));
      for (let i = 0; i < height; i++) {
        arr[i] = new Array(width);
      }
      return arr;
    }
  }
  setInCartesian(x, y, value) {
    const [screenX, screenY] = transCartesianToScreen(x, y, this);
    this.setInScreen(screenX, screenY, value);
  }
  setInScreen(x, y, value) {
    this.buffer[y][x] = value;
  }
  draw() {
    const image = this.buffer.map((row) => row.join(""));
    screenBuffer = [screenInfo].concat(image);
  }
  setInfo(string) {
    screenInfo = string;
  }
}

function transCartesianToScreen(x, y, screen) {
  return [x, screen.height - 1 - y];
}

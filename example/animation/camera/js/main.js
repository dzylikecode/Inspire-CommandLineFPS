let term = $("body").terminal({}, { greetings: "需要申请摄像头权限" });
// ASCII Camera inspired by https://codepen.io/ashleymarkfletcher/pen/QrmpPw
class Camera extends $.terminal.Animation {
  constructor(width = 1280, height = 720, ...args) {
    super(...args);
    this._characters = " .:-=+*#%@".split("").reverse();
    this._pixel_size = { y: 15, x: 7 };
    this._width = width;
    this._height = height;
    this._canvas = document.createElement("canvas");
    this._video = document.createElement("video");

    this._canvas.width = width;
    this._canvas.height = height;

    this._canvas.style.display = this._video.style.display = "none";

    document.body.appendChild(this._canvas);
    document.body.appendChild(this._video);

    this._context = this._canvas.getContext("2d");
    this._context.translate(this._width, 0);
    this._context.scale(-1, 1);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        audio: false,
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: "environment",
        },
      };
      const media = navigator.mediaDevices.getUserMedia(constraints);
      media.then((mediaStream) => {
        let stream;
        if (!acceptStream) {
          stream = window.URL.createObjectURL(mediaStream);
        } else {
          stream = mediaStream;
        }
        this._stream = stream;
        if (acceptStream) {
          this._video.srcObject = stream;
        } else {
          this._video.src = stream;
        }
        this._video.play();
        this._ready = true;
      });
    }
  }
  unmount() {
    this._stream.getTracks().forEach(function (track) {
      track.stop();
    });
  }
  char(brightness) {
    const index = Math.round(
      map(brightness, 0, 255, this._characters.length - 1, 0)
    );
    return this._characters[index];
  }
  render(term) {
    if (this._ready) {
      this._context.drawImage(this._video, 0, 0, this._width, this._height);
      const image = this._context.getImageData(0, 0, this._width, this._height);
      const pixels = image.data;
      let output = [];
      for (let y = 0; y < this._height; y += this._pixel_size.y) {
        const line = [];
        for (let x = 0; x < this._width; x += this._pixel_size.x) {
          // *4 is for each rgba value
          const index = (x + y * this._width) * 4;

          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const a = pixels[index + 3];

          const bright = Math.round((r + g + b) / 3);

          line.push(this.char(bright));
        }
        output.push(line.join("")); // 将line数组转换为字符串, 作为一行
      }
      return output;
    }
    return [];
  }
}

let acceptStream = (function () {
  return "srcObject" in document.createElement("video");
})();

// ref:https://stackoverflow.com/a/14224813/387194
function convertRange(value, r1, r2) {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}

// p5.js map
function map(n, i1, i2, o1, o2) {
  return convertRange(n, [i1, i2], [o1, o2]);
}

term.echo(new Camera(720, 500));

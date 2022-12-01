let term = $("body").terminal({});
class BarAnimation extends $.terminal.Animation {
  constructor(...args) {
    super(...args);
    this._i = 0;
  }
  render(term) {
    if (this._i > term.cols()) {
      this._i = 0;
    } else {
      this._i++;
    }
    return ["-".repeat(this._i), `${this._i}`];
  }
}
term.echo(new BarAnimation(50));

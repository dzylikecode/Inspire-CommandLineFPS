import * as test from "./utils.js";

const precision = 0.0001;
const assertFloat = (a, b) => assert.isTrue(Math.abs(a - b) < precision);
const pi = Math.PI;
const T = 2 * pi;

describe("normalize radians", function () {
  it("radians belongs to [0, 2*pi]", function () {
    assertFloat(test.normalizeRadians(2), 2);
    assertFloat(test.normalizeRadians(2.3), 2.3);
  });
  it("radians is smaller than 0", function () {
    assertFloat(test.normalizeRadians(-2), T - 2);
  });
});

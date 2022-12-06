import * as test from "./utils.js";

const precision = 0.0001;
const assertFloat = (a, b) => assert.isTrue(Math.abs(a - b) < precision);
const pi = Math.PI;
const T = 2 * pi;

describe("normalize radians", function () {
  function testUnit(actual, expect) {
    const normalized = test.normalizeRadians(actual);
    it(`normalize(${actual}) = ${normalized} to ${expect}`, function () {
      assertFloat(normalized, expect);
    });
  }
  describe("radians belongs to [0, 2*pi]", function () {
    testUnit(2, 2);
    testUnit(2.3, 2.3);
  });
  describe("radians is smaller than 0", function () {
    testUnit(-2, T - 2);
    testUnit(-2.3, T - 2.3);
  });
  describe("radians is largerr than 2*pi", function () {
    testUnit(T + 2, 2);
    testUnit(T + 2.3, 2.3);
  });
});

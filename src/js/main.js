import map from "./map.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { Screen } from "./screen.js";
import { Clock } from "./utils.js";

let nScreenWidth = 120; // Console Screen Size X (columns)
let nScreenHeight = 40; // Console Screen Size Y (rows)

let fPlayerX = 14.7; // Player Start Position
let fPlayerY = 5.09;
let fPlayerA = 0.0; // Player Start Rotation
let fFOV = 3.14159 / 4.0; // Field of View
let fDepth = 16.0; // Maximum rendering distance
let fSpeed = 5.0; // Walking Speed
let angleSpeed = fSpeed * 0.75;

// Create Screen Buffer
const screen = new Screen(nScreenWidth, nScreenHeight);
const player = new Player(fPlayerX, fPlayerY, fPlayerA, fSpeed, angleSpeed);
const camera = new Camera(nScreenWidth, nScreenHeight, fFOV, fDepth);
const clock = new Clock();
let elapsedTime;

window.addEventListener(
  "keydown",
  function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    const key = event.key.toUpperCase();
    const keyBindActions = {
      A: () => player.rotateLeft(elapsedTime),
      D: () => player.rotateRight(elapsedTime),
      W: () => player.moveForward(elapsedTime),
      S: () => player.moveBackward(elapsedTime),
    };

    keyBindActions[key]?.(); // 有可能按下没有设定的按键

    event.preventDefault();
  },
  true
);

while (1) {
  clock.tick();
  elapsedTime = clock.getDelta();

  for (let x = 0; x < nScreenWidth; x++) {
    // For each column, calculate the projected ray angle into world space
    const rayTheta =
      player.theta - camera.fov / 2.0 + (x / nScreenWidth) * camera.fov;

    // Find distance to wall
    const stepSize = 0.1; // Increment size for ray casting, decrease to increase
    let distanceToWall = 0.0; //                                      resolution

    let bHitWall = false; // Set when ray hits wall block
    let bBoundary = false; // Set when ray hits boundary between two wall blocks

    const [eyeX, eyeY] = [Math.cos(rayTheta), Math.sin(rayTheta)]; // Unit vector for ray in player space

    // Incrementally cast ray from player, along ray angle, testing for
    // intersection with a block
    while (!bHitWall && distanceToWall < camera.depth) {
      distanceToWall += stepSize;
      const rayX = player.x + eyeX * distanceToWall;
      const rayY = player.y + eyeY * distanceToWall;

      // Test if ray is out of bounds
      if (map.isOutOfBounds(rayX, rayY)) {
        bHitWall = true; // Just set distance to maximum depth
        distanceToWall = camera.depth;
      } else {
        // Ray is inbounds so test to see if the ray cell is a wall block
        if (map.isWall(rayX, rayY)) {
          // Ray has hit wall
          bHitWall = true;

          // To highlight tile boundaries, cast a ray from each corner
          // of the tile, to the player. The more coincident this ray
          // is to the rendering ray, the closer we are to a tile
          // boundary, which we'll shade to add detail to the walls
          let p;

          // Test each corner of hit tile, storing the distance from
          // the player, and the calculated dot product of the two rays
          for (let tx = 0; tx < 2; tx++)
            for (let ty = 0; ty < 2; ty++) {
              // Angle of corner to eye
              const vx = rayX + tx - player.y;
              const vy = rayY + ty - player.x;

              const length = Math.sqrt(vx * vx + vy * vy);
              const dot = (eyeX * vx + eyeY * vy) / length;
              p.push_back(make_pair(length, dot));
            }

          // Sort Pairs from closest to farthest
          sort(p.begin(), p.end(), (left, right) => left.first < right.first);

          // First two/three are closest (we will never see all four)
          let fBound = 0.01;
          if (acos(p.at(0).second) < fBound) bBoundary = true;
          if (acos(p.at(1).second) < fBound) bBoundary = true;
          if (acos(p.at(2).second) < fBound) bBoundary = true;
        }
      }
    }

    // Calculate distance to ceiling and floor
    let nCeiling = nScreenHeight / 2.0 - nScreenHeight / fDistanceToWall;
    let nFloor = nScreenHeight - nCeiling;

    // Shader walls based on distance
    let nShade = " ";
    if (fDistanceToWall <= fDepth / 4.0) nShade = 0x2588; // Very close
    else if (fDistanceToWall < fDepth / 3.0) nShade = 0x2593;
    else if (fDistanceToWall < fDepth / 2.0) nShade = 0x2592;
    else if (fDistanceToWall < fDepth) nShade = 0x2591;
    else nShade = " "; // Too far away

    if (bBoundary) nShade = " "; // Black it out

    for (let y = 0; y < nScreenHeight; y++) {
      // Each Row
      if (y <= nCeiling) screen[y * nScreenWidth + x] = " ";
      else if (y > nCeiling && y <= nFloor)
        screen[y * nScreenWidth + x] = nShade;
      // Floor
      else {
        // Shade floor based on distance
        let b = 1.0 - (y - nScreenHeight / 2.0) / (nScreenHeight / 2.0);
        if (b < 0.25) nShade = "#";
        else if (b < 0.5) nShade = "x";
        else if (b < 0.75) nShade = ".";
        else if (b < 0.9) nShade = "-";
        else nShade = " ";
        screen[y * nScreenWidth + x] = nShade;
      }
    }
  }

  // Display Stats
  const stateInfo = `X=${fPlayerX.toFixed(2)}, Y=${fPlayerY.toFixed(
    2
  )}, A=${fPlayerA.toFixed(2)}, FPS=${(1.0 / fElapsedTime).toFixed(2)}`;

  // Display Map
  for (let nx = 0; nx < nMapWidth; nx++)
    for (let ny = 0; ny < nMapWidth; ny++) {
      screen[(ny + 1) * nScreenWidth + nx] = map[ny * nMapWidth + nx];
    }
  screen[(fPlayerX + 1) * nScreenWidth + fPlayerY] = "P";

  // Display Frame
  WriteConsoleOutputCharacter(
    hConsole,
    screen,
    nScreenWidth * nScreenHeight,
    { X: 0, Y: 0 },
    dwBytesWritten
  );
}

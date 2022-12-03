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
    const rayStartTheta = player.theta - fFOV / 2.0;
    const rayTheta = rayStartTheta + (x / nScreenWidth) * camera.fov;

    // Find distance to wall
    const stepSize = 0.1; // Increment size for ray casting, decrease to increase
    let distanceToWall = 0.0; //                                      resolution

    let bHitWall = false; // Set when ray hits wall block
    let bBoundary = false; // Set when ray hits boundary between two wall blocks

    const [rayDirX, rayDirY] = [Math.cos(rayTheta), Math.sin(rayTheta)]; // Unit vector for ray in player space

    // Incrementally cast ray from player, along ray angle, testing for
    // intersection with a block
    while (!bHitWall && distanceToWall < camera.depth) {
      distanceToWall += stepSize;
      const rayX = player.x + rayDirX * distanceToWall;
      const rayY = player.y + rayDirY * distanceToWall;

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

          const wallX = Math.floor(rayX);
          const wallY = Math.floor(rayY);
          const corner = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ];

          const visibleCornerDistribution = [
            [
              [0, 1, 3],
              [0, 1],
              [0, 1, 2],
            ],
            [[0, 3], [-1], [1, 2]],
            [
              [0, 2, 3],
              [2, 3],
              [1, 2, 3],
            ],
          ];

          function mapPosToCornerDistribution(pos, cornerPos) {
            if (pos < cornerPos) return 0;
            else if (pos === cornerPos) return 1;
            else return 2;
          }

          const [distriX, distriY] = [
            mapPosToCornerDistribution(player.x, wallX),
            mapPosToCornerDistribution(player.y, wallY),
          ];

          const visibleCorner = visibleCornerDistribution[distriX][distriY].map(
            (index) => corner[index]
          );

          const thetaVisibleCornerToRay = visibleCorner.map(([cx, cy]) => {
            const wallXToPlayer = wallX + cx - player.x;
            const wallYToPlayer = wallY + cy - player.y;
            const length = Math.sqrt(
              // Distance from ray to player
              wallXToPlayer * wallXToPlayer + wallYToPlayer * wallYToPlayer
            );
            const cosTheta =
              (wallXToPlayer * rayDirX + wallYToPlayer * rayDirY) / length;
            return Math.acos(cosTheta);
          });

          const thetaBound = 0.01; // When ray is this close to a boundary, consider it as intersecting
          bBoundary = thetaVisibleCornerToRay.some(
            // If ray is close to any of the tile's corners
            (theta) => theta < thetaBound
          );
        }
      }
    }

    // Calculate distance to ceiling and floor
    const ceiling = nScreenHeight / 2.0 - nScreenHeight / distanceToWall;
    const floor = nScreenHeight - ceiling;

    const wallShade = getWallShade(distanceToWall / camera.depth);

    if (bBoundary) nShade = " "; // Black it out

    for (let y = 0; y < nScreenHeight; y++) {
      // Each Row
      if (y <= nCeiling) screen[y][x] = " ";
      else if (y > ceiling && y <= floor) screen[y][x] = wallShade;
      // Floor
      else {
        // Shade floor based on distance
        let b = 1.0 - (y - nScreenHeight / 2.0) / (nScreenHeight / 2.0);
        screen[y][x] = getFloorShade(b);
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

function getWallShade(dist) {
  // Shader walls based on distance
  let shade = " ";
  if (dist <= 1 / 4.0) shade = `\u2588`; // Very close
  else if (dist < 1 / 3.0) shade = `\u2593`;
  else if (dist < 1 / 2.0) shade = `\u2592`;
  else if (dist < 1) shade = `\u2591`;
  else shade = " "; // Too far away
  return shade;
}

function getFloorShade(dist) {
  // Shade floor based on distance
  let shade = " ";
  if (dist < 0.25) shade = "#";
  else if (dist < 0.5) shade = "x";
  else if (dist < 0.75) shade = ".";
  else if (dist < 0.9) shade = "-";
  else shade = " ";
  return shade;
}

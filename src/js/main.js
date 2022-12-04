import map from "./map.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { Screen } from "./screen.js";
import { Clock } from "./utils.js";
import { checkRayHitWallBound } from "./checkRayHitWallBound.js";

const nScreenWidth = 120; // Console Screen Size X (columns)
const nScreenHeight = 40; // Console Screen Size Y (rows)

const fPlayerX = 14.7; // Player Start Position
const fPlayerY = 5.09;
const fPlayerA = 0.0; // Player Start Rotation
const fFOV = 3.14159 / 4.0; // Field of View
const fDepth = 16.0; // Maximum rendering distance
const fSpeed = 5.0; // Walking Speed
const angleSpeed = fSpeed * 0.75;

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

  for (let x = 0; x < screen.width; x++) {
    // For each column, calculate the projected ray angle into world space
    const rayStartTheta = player.theta - fFOV / 2.0;
    const rayTheta = rayStartTheta + (x / screen.width) * camera.fov;

    const [rayDirX, rayDirY] = [Math.cos(rayTheta), Math.sin(rayTheta)]; // Unit vector for ray in player space

    const {
      stopMsg,
      ray: { x: rayX, y: rayY },
      distanceToWall,
    } = emitRay(
      { x: player.x, y: player.y, depth: camera.depth },
      { x: rayDirX, y: rayDirY },
      map
    );

    let bBoundary = false; // Set when ray hits boundary between two wall blocks

    if (stopMsg == "HitWall") {
      // To highlight tile boundaries, cast a ray from each corner
      // of the tile, to the player. The more coincident this ray
      // is to the rendering ray, the closer we are to a tile
      // boundary, which we'll shade to add detail to the walls

      const wallX = Math.floor(rayX);
      const wallY = Math.floor(rayY);
      const thetaBound = 0.01; // When ray is this close to a boundary, consider it as intersecting

      bBoundary = checkRayHitWallBound(
        { x: rayDirX, y: rayDirY },
        { x: wallX, y: wallY },
        { x: player.x, y: player.y },
        thetaBound
      );
    }

    // 注意坐标系变换

    // Calculate distance to ceiling and floor
    const ceiling = screen.height * (1 / 2.0 + 1 / distanceToWall);
    const floor = screen.height - ceiling;

    const wallShade = bBoundary
      ? " " // Black it out
      : getWallShade(distanceToWall / camera.depth);

    for (let y = 0; y < screen.height; y++) {
      // Each Row
      let shade = "";
      if (y <= floor) shade = " ";
      else if (y > floor && y <= ceiling) shade = wallShade;
      // Floor
      else {
        // Shade floor based on distance
        let b = 1.0 - (y - screen.height / 2.0) / (screen.height / 2.0);
        shade = getFloorShade(b);
      }
      const [screenX, screenY] = transCartesianToScreen(x, y, screen);
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

// Incrementally cast ray from player, along ray angle, testing for
// intersection with a block
function emitRay(camera, emitDir, map) {
  const stepSize = 0.1; // Increment size for ray casting, decrease to increase
  let distanceToWall = 0.0;
  let stopMsg = "";
  let rayX = 0;
  let rayY = 0;
  while (1) {
    distanceToWall += stepSize;
    rayX = camera.x + emitDir.x * distanceToWall;
    rayY = camera.y + emitDir.y * distanceToWall;
    if (distanceToWall > camera.depth) {
      stopMsg = "OutOfDepth";
      distanceToWall = camera.depth;
      break;
    } else if (map.isOutOfBounds(rayX, rayY)) {
      stopMsg = "OutOfBound";
      break;
    } else if (map.isWall(rayX, rayY)) {
      stopMsg = "HitWall";
      break;
    }
  }
  return {
    stopMsg: stopMsg,
    ray: { x: rayX, y: rayY },
    distanceToWall: distanceToWall,
  };
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

function transCartesianToScreen(x, y, screen) {
  return [x, screen.height - y];
}

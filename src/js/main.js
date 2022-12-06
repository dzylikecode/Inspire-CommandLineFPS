import map from "./map.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { Screen } from "./screen.js";
import { Clock, format3d2, formatRad } from "./utils.js";
import { checkRayHitWallBound } from "./checkRayHitWallBound.js";
import { getFloorShade, getWallShade } from "./shade.js";
import { emitRay } from "./ray.js";
import { setGameLoop } from "./gameFrame.js";

const screenWidth = 80; // Console Screen Size X (columns)
const screenHeight = 40; // Console Screen Size Y (rows)

const playerStartX = 12.7; // Player Start Position
const playerStartY = 5.09;
const playerStartTheta = Math.PI / 2; // Player Start Rotation
const playerSpeed = 5.0; // Walking Speed
const angleSpeed = playerSpeed * 0.75;
const cameraFov = Math.PI / 4.0; // Field of View
const cameraDepth = 16.0; // Maximum rendering distance

// Create Screen Buffer
const screen = new Screen(screenWidth, screenHeight);
const player = new Player(
  playerStartX,
  playerStartY,
  playerStartTheta,
  playerSpeed,
  angleSpeed
);
const camera = new Camera(screenWidth, screenHeight, cameraFov, cameraDepth);
camera.attachTo(player);
const clock = new Clock();
let elapsedTime;

setGameLoop(mainGame);

window.addEventListener(
  "keydown",
  function (event) {
    // if (event.defaultPrevented) {
    //   return; // Do nothing if the event was already processed
    // }

    const key = event.key.toUpperCase();
    const keyBindActions = {
      A: () => player.rotateLeft(elapsedTime), // 参考系的问题, 需要变换一下
      D: () => player.rotateRight(elapsedTime),
      W: () => player.moveForward(elapsedTime),
      S: () => player.moveBackward(elapsedTime),
    };

    if (key in keyBindActions) {
      keyBindActions[key]?.(); // 有可能按下没有设定的按键

      event.preventDefault();
    }
  },
  true
);

function mainGame() {
  clock.tick();
  elapsedTime = clock.getDelta();

  for (let x = 0; x < screen.width; x++) {
    // For each column, calculate the projected ray angle into world space
    const rayStartTheta = player.theta + camera.fov / 2.0; // 从左往右扫描
    const rayTheta = rayStartTheta - (x / screen.width) * camera.fov;

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
      // Shade based on distance
      if (y <= floor) shade = getFloorShade(y / (screen.height / 2.0));
      else if (y > floor && y <= ceiling) shade = wallShade;
      else shade = " "; // Ceiling

      screen.setInCartesian(x, y, shade);
    }
  }

  // Display Map
  for (let nx = 0; nx < map.width; nx++)
    for (let ny = 0; ny < map.height; ny++) {
      screen.setInScreen(nx, ny, map.src[ny][nx]);
    }
  // Display Player
  const [playerMapX, playerMapY] = map.transCartesianToScreen(
    Math.floor(player.x),
    Math.floor(player.y)
  );

  screen.setInScreen(playerMapX, playerMapY, "P");

  // Display Stats
  const stateX = format3d2(player.x); // Catesian Coordinates
  const stateY = format3d2(player.y);
  const stateTheta = formatRad(player.theta) + "°";
  const stateFPS = format3d2(1.0 / elapsedTime);
  const stateInfo = `X=${stateX}, Y=${stateY}, A=${stateTheta}, FPS=${stateFPS}`;
  screen.setInfo(stateInfo);

  // Display Frame
  screen.draw();
}

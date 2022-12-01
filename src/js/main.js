let nScreenWidth = 120; // Console Screen Size X (columns)
let nScreenHeight = 40; // Console Screen Size Y (rows)
let nMapWidth = 16; // World Dimensions
let nMapHeight = 16;

let fPlayerX = 14.7; // Player Start Position
let fPlayerY = 5.09;
let fPlayerA = 0.0; // Player Start Rotation
let fFOV = 3.14159 / 4.0; // Field of View
let fDepth = 16.0; // Maximum rendering distance
let fSpeed = 5.0; // Walking Speed

// Create Screen Buffer
let screen = new Array(nScreenWidth * nScreenHeight);

// Create Map of world space # = wall block, . = space
let map = [
  "#########.......",
  "#...............",
  "#.......########",
  "#..............#",
  "#......##......#",
  "#......##......#",
  "#..............#",
  "###............#",
  "##.............#",
  "#......####..###",
  "#......#.......#",
  "#......#.......#",
  "#..............#",
  "#......#########",
  "#..............#",
  "################",
];

let thisLoop = new Date();
let lastLoop = new Date();

window.addEventListener(
  "keydown",
  function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    switch (event.key) {
      case "A":
        // Handle CCW Rotation
        fPlayerA -= fSpeed * 0.75 * fElapsedTime;
        break;
      case "ArrowUp":
        // Handle CW Rotation
        fPlayerA += fSpeed * 0.75 * fElapsedTime;
        break;
      case "W":
        // Handle Forwards movement & collision
        fPlayerX += sinf(fPlayerA) * fSpeed * fElapsedTime;
        fPlayerY += cosf(fPlayerA) * fSpeed * fElapsedTime;
        if (map[fPlayerX * nMapWidth + fPlayerY] == "#") {
          // 注意取整
          fPlayerX -= sinf(fPlayerA) * fSpeed * fElapsedTime;
          fPlayerY -= cosf(fPlayerA) * fSpeed * fElapsedTime;
        }
        break;
      case "S":
        // Handle backwards movement & collision
        fPlayerX -= sinf(fPlayerA) * fSpeed * fElapsedTime;
        fPlayerY -= cosf(fPlayerA) * fSpeed * fElapsedTime;
        if (map[fPlayerX * nMapWidth + fPlayerY] == "#") {
          fPlayerX += sinf(fPlayerA) * fSpeed * fElapsedTime;
          fPlayerY += cosf(fPlayerA) * fSpeed * fElapsedTime;
        }
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  },
  true
);
// the last option dispatches the event to the listener first,
// then dispatches event to window

while (1) {
  // We'll need time differential per frame to calculate modification
  // to movement speeds, to ensure consistant movement, as ray-tracing
  // is non-deterministic
  thisLoop = new Date();
  let elapsedTime = thisLoop - lastLoop;
  lastLoop = thisLoop;
  let fElapsedTime = elapsedTime;

  for (let x = 0; x < nScreenWidth; x++) {
    // For each column, calculate the projected ray angle into world space
    let fRayAngle = fPlayerA - fFOV / 2.0 + (x / nScreenWidth) * fFOV;

    // Find distance to wall
    let fStepSize = 0.1; // Increment size for ray casting, decrease to increase
    let fDistanceToWall = 0.0; //                                      resolution

    let bHitWall = false; // Set when ray hits wall block
    let bBoundary = false; // Set when ray hits boundary between two wall blocks

    let fEyeX = sinf(fRayAngle); // Unit vector for ray in player space
    let fEyeY = cosf(fRayAngle);

    // Incrementally cast ray from player, along ray angle, testing for
    // intersection with a block
    while (!bHitWall && fDistanceToWall < fDepth) {
      fDistanceToWall += fStepSize;
      let nTestX = fPlayerX + fEyeX * fDistanceToWall;
      let nTestY = fPlayerY + fEyeY * fDistanceToWall;

      // Test if ray is out of bounds
      if (
        nTestX < 0 ||
        nTestX >= nMapWidth ||
        nTestY < 0 ||
        nTestY >= nMapHeight
      ) {
        bHitWall = true; // Just set distance to maximum depth
        fDistanceToWall = fDepth;
      } else {
        // Ray is inbounds so test to see if the ray cell is a wall block
        if (map[nTestX * nMapWidth + nTestY] == "#") {
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
              let vy = nTestY + ty - fPlayerY;
              let vx = nTestX + tx - fPlayerX;
              let d = sqrt(vx * vx + vy * vy);
              let dot = (fEyeX * vx) / d + (fEyeY * vy) / d;
              p.push_back(make_pair(d, dot));
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
  swprintf_s(
    screen,
    "X=%3.2f, Y=%3.2f, A=%3.2f FPS=%3.2f ",
    fPlayerX,
    fPlayerY,
    fPlayerA,
    1.0 / fElapsedTime
  );

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

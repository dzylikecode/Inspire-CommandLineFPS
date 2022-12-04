export function getWallShade(dist) {
  // Shader walls based on distance
  let shade = " ";

  if (dist <= 1 / 4.0) shade = `\u2588`; // █
  else if (dist < 1 / 3.0) shade = `\u2593`; // ▓
  else if (dist < 1 / 2.0) shade = `\u2592`; // ▒
  else if (dist < 1) shade = `\u2591`; // ░
  else shade = " "; // Too far away

  return shade;
}

export function getFloorShade(dist) {
  // Shade floor based on distance
  let shade = " ";
  if (dist < 0.25) shade = "#";
  else if (dist < 0.5) shade = "x";
  else if (dist < 0.75) shade = ".";
  else if (dist < 0.9) shade = "-";
  else shade = " ";
  return shade;
}

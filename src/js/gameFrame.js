export let gameLoop = () => ({});

export function setGameLoop(fn) {
  gameLoop = fn;
}

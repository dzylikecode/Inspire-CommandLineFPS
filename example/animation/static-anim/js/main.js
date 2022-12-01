let term = $("body").terminal({});
term.echo(
  new $.terminal.FramesAnimation(
    [
      [".", "|", "."],
      [" .", " |", " ."],
      ["  .", "  |", "  ."],
      [" .", " |", " ."],
      [".", "|", "."],
    ],
    8
  )
);
term.echo(
  new $.terminal.FramesAnimation(
    [
      ["  o    ", "       ", "       ", "       "],
      ["       ", "   o   ", "       ", "       "],
      ["       ", "       ", "    o  ", "       "],
      ["       ", "       ", "       ", "     o "],
      ["       ", "       ", "      o", "       "],
      ["       ", "     o ", "       ", "       "],
      ["    o  ", "       ", "       ", "       "],
      ["       ", "   o   ", "       ", "       "],
      ["       ", "       ", "  o    ", "       "],
      ["       ", "       ", "       ", " o     "],
      ["       ", "       ", "o      ", "       "],
      ["       ", " o     ", "       ", "       "],
    ],
    8
  )
);

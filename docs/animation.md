# animation

## 动画格式

`[line1, line2, line3]` 每个元素是一行, 整个数组是一帧

## 固定形式

```js
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
```

8: 代表帧率, 如果是 60, 则会运行得非常的快(动画的速度是与帧率相关的)

- <a class="GitHub Repos" href="../example/animation/static-anim/js/main.js">code</a>
- <a class="GitHub Pages" href="../example/animation/static-anim/index.html">preview</a>

## 动态生成

- <a class="GitHub Repos" href="../example/animation/dynamic-anim/js/main.js">code</a>
- <a class="GitHub Pages" href="../example/animation/dynamic-anim/index.html">preview</a>

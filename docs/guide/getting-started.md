# Getting Started

## Install

```bash
npm install @ilyeshdz/ts-plate
```

Or with your package manager of choice:

```bash
pnpm add @ilyeshdz/ts-plate
yarn add @ilyeshdz/ts-plate
bun add @ilyeshdz/ts-plate
```

That's it. One dependency, zero transitive deps.

## Your first tree

The simplest possible thing you can do is create a single file and emit it:

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
// [{ type: "file", path: "hello.txt", content: "Hello, world!" }]
```

`emit` gives you a flat list of outputs. Nothing is written to disk yet — you
can inspect the array, modify it, or pass it to `write()`.

## Writing to disk

Once you have outputs, writing them is straightforward:

```ts
import { write } from "@ilyeshdz/ts-plate";

await write(outputs);
// Creates hello.txt in the current working directory
```

Pass a `basePath` to control where files are written:

```ts
await write(outputs, "./output");
// Creates ./output/hello.txt
```

## Directories and nesting

Real projects have folders. `dir()` creates one, and you nest children inside it:

```ts
import { root, dir, file, emit } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "project",
    file("README.md", "# My Project"),
    dir(
      "src",
      file("index.ts", `console.log("hello")`),
      dir("utils", file("math.ts", `export const add = (a, b) => a + b`)),
    ),
  ),
);

const outputs = await emit(tree);
```

The result is a flat, ordered list of directories and files:

```
[
  { type: "dir",  path: "project" },
  { type: "file", path: "project/README.md",       content: "# My Project" },
  { type: "dir",  path: "project/src" },
  { type: "file", path: "project/src/index.ts",     content: 'console.log("hello")' },
  { type: "dir",  path: "project/src/utils" },
  { type: "file", path: "project/src/utils/math.ts", content: "export const add = (a, b) => a + b" },
]
```

Directories come before their contents — that's a guarantee. The order is always
deterministic: depth-first, children after parent.

## Using `render()` for convenience

If you just want to emit and write in one step, use `render()`:

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render(root(dir("project", file("index.ts", `console.log("hi")`))), "./out");

// Files are on disk, and outputs are still returned for inspection
```

## What's next?

- [Why ts-plate?](/guide/why-ts-plate) — philosophy and how it compares
- [Core Concepts](/guide/core-concepts) — the tree + flat model explained
- [API Reference](/api/) — every function and type documented
- [Recipes](/guide/recipes) — practical patterns and real-world examples

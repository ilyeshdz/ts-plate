# Getting Started

ts-plate is deliberately uncomplicated. If you can write TypeScript, you already know most of what you need.

## Install

```bash
npm install @ilyeshdz/ts-plate
```

Or use your package manager of choice:

```bash
pnpm add @ilyeshdz/ts-plate
yarn add @ilyeshdz/ts-plate
bun add @ilyeshdz/ts-plate
```

## Your first tree

Start with a single file and emit it:

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

`emit()` turns tree nodes into a flat list of outputs. That list is the first place where the project becomes tangible: you can log it, snapshot it, transform it, or pass it on to `write()`.

## Write it to disk

If the outputs look right, write them:

```ts
import { write } from "@ilyeshdz/ts-plate";

await write(outputs);
await write(outputs, "./output");
```

The optional `basePath` is useful when you want to target a temp directory, a build folder, or a user-selected workspace.

## Add structure

Real projects need folders, not just files. `dir()` lets you express that directly:

```ts
import { root, dir, file, emit } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "project",
    file("README.md", "# My Project"),
    dir("src", file("index.ts", `console.log("hello")`)),
  ),
);

const outputs = await emit(tree);
```

The emitted result is deterministic:

- directories appear before their children
- traversal is depth-first
- insertion order is preserved

That predictability is not a cosmetic detail. It is what makes the library pleasant to test and easy to reason about.

## Use `render()` when you want the common path

If your workflow is simply "build then write", `render()` does both:

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render(
  [root(dir("project", file("index.ts", `console.log("hi")`)))],
  "./out",
);
```

You still get the emitted outputs back, which means the operation remains inspectable even when the filesystem has already been updated.

## What to read next

- [Why ts-plate?](/guide/why-ts-plate) for the philosophy and tradeoffs
- [Core Concepts](/guide/core-concepts) for the tree and flat-output model
- [Recipes](/guide/recipes) for practical patterns
- [API Reference](/api/) for the full type surface

# Introduction

## Why another file generator?

Most tools make you learn a template language or hand control to a CLI. That works until you need something custom.

ts-plate does one thing: describe file trees with ordinary TypeScript functions. The tree is just data. You build it, inspect it, then write it.

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

## The pipeline

Generation happens in four stages. Each one is optional, and nothing runs until you call it.

**Build** - Compose nodes using `file`, `dir`, `root`, `when`, and `copy`. No side effects.

```ts
const tree = root(
  dir("src", file("index.ts", `export const VERSION = "1.0"`)),
  file("README.md", "# My Project"),
);
```

**Emit** - Walk the tree, resolve lazy content, validate filenames, flatten to an array.

```ts
const outputs = await emit(tree);
```

**Inspect** - It's just an array. Log it, filter it, snapshot it.

```ts
console.log(outputs);
```

**Write** - Persist to disk with configurable conflict handling.

```ts
await write(outputs);
```

## Philosophy

**Trees are data.** A `file()` returns a plain object. Pass it around, nest it, log it. No hidden state.

**Lazy evaluation.** Content functions run at emit time, not build time. Defer API calls and timestamps to when they're actually needed.

**Composition.** Wrap a tree in a function, call it from another module, nest it inside a directory. Functions are all you need.

## When to use it

ts-plate is for building generators, CLIs, and scaffolding tools. It is not a CLI itself. Use it when you want full control over how files are generated. Skip it if you want something turnkey.

## Real-world example: create-ts-plate

[`create-ts-plate`](https://github.com/ilyeshdz/create-ts-plate) is an interactive scaffolding CLI built entirely on ts-plate. It shows what a production-ready generator looks like:

- Uses `when()` to conditionally scaffold features (TypeScript, tests, etc.)
- Composes reusable factory functions for components, configs, and project files
- Lets the user preview the tree before writing via `emit()` — a true dry run
- Calls `write()` only after confirmation

Try it:

```bash
npx create-ts-plate
```

It's also the best reference for patterns and conventions if you want to build your own CLI on top of ts-plate.

## Install

::: code-group

```bash [npm]
npm install @ilyeshdz/ts-plate
```

```bash [pnpm]
pnpm add @ilyeshdz/ts-plate
```

```bash [yarn]
yarn add @ilyeshdz/ts-plate
```

```bash [bun]
bun add @ilyeshdz/ts-plate
```

:::

## Example

```ts
import { root, dir, file, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "my-app",
    file("package.json", { name: "my-app", version: "1.0.0" }),
    dir("src", file("index.ts", `console.log("hello")`)),
  ),
);

const outputs = await emit(tree);
await write(outputs);
```

This creates `my-app/package.json` and `my-app/src/index.ts`.

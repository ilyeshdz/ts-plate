# @ilyeshdz/ts-plate

> Build file trees with TypeScript, not templates.

[![npm](https://img.shields.io/npm/v/@ilyeshdz/ts-plate)](https://www.npmjs.com/package/@ilyeshdz/ts-plate)

A tiny, zero-dependency TypeScript library for describing file trees as data and writing them to disk.

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

It is not a scaffolding CLI. It is the generation layer you build your own tools on.

## Install

```bash
npm install @ilyeshdz/ts-plate
pnpm add @ilyeshdz/ts-plate
yarn add @ilyeshdz/ts-plate
bun add @ilyeshdz/ts-plate
```

## Quick start

```ts
import { root, dir, file, when, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "project",
    file("README.md", "# My Project"),
    dir("src", file("index.ts", `console.log("hello")`)),
    when(true, file("debug.log")),
  ),
);

const outputs = await emit(tree);
await write(outputs);
```

## Docs

See the [documentation site](https://ilyeshdz.github.io/ts-plate) for the full guide.

## License

MIT © [Ilyes Hernandez](https://github.com/ilyeshdz)

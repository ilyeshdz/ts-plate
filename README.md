# @ilyeshdz/ts-plate

> Build file trees with TypeScript, not templates.

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/@ilyeshdz/ts-plate)](https://npmx.dev/package/@ilyeshdz/ts-plate)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/size/@ilyeshdz/ts-plate)](https://npmx.dev/package/@ilyeshdz/ts-plate)

A tiny, zero-dependency TypeScript library for describing file trees as data and writing them to disk.

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

It is not a scaffolding CLI. It is the generation layer you build your own tools on.

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

## Project starter

Use [`create-ts-plate`](https://github.com/ilyeshdz/create-ts-plate) to scaffold a new project with ts-plate pre-configured:

```bash
pnpm create ts-plate
npm create ts-plate
bun create ts-plate
yarn create ts-plate
```

It prompts for TypeScript, Vitest, CLI binary setup, and more — then generates a ready-to-use project with ts-plate already wired in. The CLI itself is also built with ts-plate under the hood.

## Docs

See the [documentation site](https://ilyeshdz.github.io/ts-plate) for the full guide.

## License

MIT © [Ilyes Hernandez](https://github.com/ilyeshdz)

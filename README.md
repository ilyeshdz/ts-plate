# @ilyeshdz/ts-plate

> Build file trees with TypeScript, not templates.

[![npm](https://img.shields.io/npm/v/@ilyeshdz/ts-plate)](https://www.npmjs.com/package/@ilyeshdz/ts-plate)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

`ts-plate` is a tiny, zero-dependency TypeScript library for composing file trees the way you already write software: with functions, data, conditions, and composition.

It is not a scaffolding CLI. It is the engine you reach for when you want to build one.

## Why this exists

Most generator tools ask you to learn a second way of thinking. They ship a template language, a directory convention, or a CLI workflow that is fine until your project stops being simple.

`ts-plate` takes a different path:

- write generator logic in TypeScript
- keep your file tree as data
- inspect the result before it hits disk
- stay fully in control of how your tool behaves

That makes it a good fit for teams building custom CLIs, code generators, project starters, and systems like Bitpress that need a small but serious foundation underneath them.

If you want a ready-made `npx ...` experience, this is probably not the right package. If you want a minimal library that lets you build that experience yourself, this is exactly the point.

## What it gives you

`ts-plate` is intentionally small. The entire library is built around three stages:

1. **Build** a tree with `file()`, `dir()`, `root()`, `when()`, and `copy()`
2. **Emit** that tree into a deterministic flat list
3. **Write** the outputs to disk when you are ready

That separation matters. It means you can:

- dry-run a generator before writing anything
- filter or transform outputs before they land on disk
- reuse the same tree in multiple contexts
- keep the logic readable for future maintainers

## Install

```bash
npm install @ilyeshdz/ts-plate
```

Works with any package manager:

```bash
pnpm add @ilyeshdz/ts-plate
yarn add @ilyeshdz/ts-plate
bun add @ilyeshdz/ts-plate
```

## Quick start

The smallest useful example is a single file:

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
// [{ type: "file", path: "hello.txt", content: "Hello, world!" }]
```

`emit()` returns a flat array. Nothing touches the filesystem yet, which means you can inspect, transform, or test the result before writing it.

## Directories and nesting

Real projects are trees, so `dir()` lets you nest structure naturally:

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

The emitted order is deterministic: parents first, then children, depth-first. That makes the output predictable for tests and safe for downstream tooling.

## Writing to disk

When you are happy with the outputs, write them:

```ts
import { write } from "@ilyeshdz/ts-plate";

await write(outputs);
await write(outputs, "./output");
```

## Emit and write together

If you want the common path in one step, use `render()`:

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render([root(dir("project", file("index.ts", `console.log("hi")`)))], "./out");
```

## Lazy content

File content can be a function. That function is only evaluated when `emit()` runs:

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const node = file("timestamp.txt", () => new Date().toISOString());
const [output] = await emit(node);
```

Async content works too:

```ts
const node = file("readme.md", async () => {
  const res = await fetch("https://api.example.com/docs");
  return await res.text();
});
```

That lazy boundary is one of the quiet strengths of the library. It keeps generator code honest: you decide when work happens, and nothing is evaluated early by accident.

## Conditional structure

Use `when()` to include or skip parts of a tree:

```ts
import { when, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(
  file("index.ts"),
  when(true, dir("types", file("types.ts"))),
  when(false, file("unused.ts")),
  when(() => opts.typescript, file("tsconfig.json")),
);
```

## Copying files

`copy()` is for pulling a file from outside the tree and copying it at write time:

```ts
import { copy, root } from "@ilyeshdz/ts-plate";

const tree = root(copy("/absolute/path/to/LICENSE", "LICENSE"));
```

## The mental model

The library is easiest to understand if you remember this:

- build with tree nodes
- inspect with emitted outputs
- persist with `write()`

That is the whole philosophy. No hidden runtime, no template engine, no CLI layer pretending to be a library.

## API

| Function                       | Description                         |
| ------------------------------ | ----------------------------------- |
| `file(name, content?)`         | Create a file node                  |
| `dir(name, ...children)`       | Create a directory node             |
| `root(...children)`            | Create a root container             |
| `emit(...nodes)`               | Flatten tree(s) into output entries |
| `write(outputs, basePath?)`    | Write outputs to disk               |
| `render(nodes, basePath?)`     | Emit + write in one call            |
| `when(condition, ...children)` | Conditionally include nodes         |
| `copy(from, name)`             | Copy an external file into the tree |

See the [API reference](./docs/api/index.md) and the [guides](./docs/guide/getting-started.md) for more detail.

## Contributing

Issues and pull requests are welcome.

This project is intentionally small, so changes should earn their place. If you have an idea that improves the library or its documentation, open an issue first so we can keep the direction clear.

Development:

```bash
pnpm install
pnpm test
pnpm build
pnpm docs:dev
```

## License

MIT © [Ilyes Hernandez](https://github.com/ilyeshdz)

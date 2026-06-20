# @ilyeshdz/ts-plate

> Build file trees with functions, not templates.

[![npm](https://img.shields.io/npm/v/@ilyeshdz/ts-plate)](https://www.npmjs.com/package/@ilyeshdz/ts-plate)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

A tiny, zero-dependency TypeScript library for composing file structures the same way you write code — with functions, conditions, and composition. No CLI. No template language. No magic.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Background

I've used Yeoman, Plop, Hygen, and every other scaffolder out there. They all share the same problem: they make you learn a second language. Templates, EJS, Handlebars, Jinja — you end up fighting syntax, debugging indentation, and wishing you could just use the language you already know.

That's why ts-plate exists. Your file tree is just data. Functions build it, conditions shape it, and at the end you get a flat list of files you can inspect, filter, or write to disk. Three stages, one pipeline:

- **Build** — compose trees with `file()`, `dir()`, `root()`, `when()`, `copy()`
- **Emit** — flatten the tree into a deterministic array of outputs
- **Write** — optionally write those entries to disk

Each stage is independent. You can emit without writing, write without emitting, or inspect the flat list before committing anything.

For more on the philosophy and how ts-plate compares to other tools, see [Why ts-plate?](https://github.com/ilyeshdz/ts-plate/guide/why-ts-plate).

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

## Usage

The simplest thing you can do is create a file and emit it:

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
// [{ type: "file", path: "hello.txt", content: "Hello, world!" }]
```

`emit` returns a flat list of outputs. Nothing touches disk — you can inspect the array, modify it, or pass it to `write()`.

### Directories and nesting

Real projects have folders. `dir()` creates one, and you nest children inside it:

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

Outputs are ordered deterministically: depth-first, parents before children.

### Writing to disk

```ts
import { write } from "@ilyeshdz/ts-plate";

await write(outputs);
// Creates files in the current working directory

await write(outputs, "./output");
// Creates files in ./output
```

### Emit + write in one call

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render(root(dir("project", file("index.ts", `console.log("hi")`))), "./out");
```

### Lazy file content

Content can be a function evaluated only when `emit()` runs:

```ts
const node = file("timestamp.txt", () => new Date().toISOString());
const [output] = await emit(node);
// content is computed at emit time, not tree-build time
```

Async functions work too:

```ts
const node = file("readme.md", async () => {
  const res = await fetch("https://api.example.com/docs");
  return res.text();
});
```

### Conditional nodes

Include or skip parts of the tree with `when()`:

```ts
import { when } from "@ilyeshdz/ts-plate";

const tree = root(
  file("index.ts"),
  when(true, dir("types", file("types.ts"))),
  when(false, file("unused.ts")),
  when(() => opts.typescript, file("tsconfig.json")),
);
```

### Copy external files

Reference a file outside the tree and have it copied at write time:

```ts
import { copy } from "@ilyeshdz/ts-plate";

const tree = root(file("README.md", "# Project"), copy("/absolute/path/to/LICENSE", "LICENSE"));
```

### Full project scaffold

A more complete example combining everything:

```ts
import { render, root, dir, file, when } from "@ilyeshdz/ts-plate";

interface Options {
  name: string;
  typescript?: boolean;
  tests?: boolean;
}

async function scaffold(opts: Options) {
  const tree = root(
    dir(
      opts.name,
      file("README.md", `# ${opts.name}`),
      file("package.json", { name: opts.name, version: "0.1.0", type: "module" }),
      dir("src", file(opts.typescript ? "index.ts" : "index.js", "")),
      when(opts.tests, dir("tests", file("index.test.ts", ""))),
    ),
  );
  return render(tree);
}
```

For more recipes, check the [Recipes guide](https://github.com/ilyeshdz/ts-plate/guide/recipes).

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

See the [full API reference](https://github.com/ilyeshdz/ts-plate/api/) for details and types.

## Contributing

PRs and issues are welcome! This project is small, focused, and meant to stay that way — but if you have an idea that fits, feel free to open an issue first to discuss it.

This project uses [oxlint](https://oxc.rs/) for linting, [oxfmt](https://oxc.rs/) for formatting, and [Vitest](https://vitest.dev/) for tests.

```bash
pnpm install
pnpm test
pnpm build
pnpm docs:dev    # documentation dev server
```

## License

MIT © [Ilyes Hernandez](https://github.com/ilyeshdz)

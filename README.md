# @ilyeshdz/ts-plate

A lightweight library for building file trees declaratively.

## Install

```bash
npm install @ilyeshdz/ts-plate
```

## API Overview

| Function                       | Description                         |
| ------------------------------ | ----------------------------------- |
| `file(name, content?)`         | Create a file node                  |
| `dir(name, ...children)`       | Create a directory node             |
| `root(...children)`            | Create a root container             |
| `emit(...nodes)`               | Flatten tree(s) into output entries |
| `write(outputs, basePath?)`    | Write outputs to disk               |
| `when(condition, ...children)` | Conditionally include nodes         |

## Usage

### Basic file tree

```ts
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(
  dir("src", file("index.ts", `console.log("hello")`), dir("utils", file("helpers.ts"))),
);

const outputs = await emit(tree);
// [
//   { type: "dir",  path: "src" },
//   { type: "file", path: "src/index.ts",    content: 'console.log("hello")' },
//   { type: "dir",  path: "src/utils" },
//   { type: "file", path: "src/utils/helpers.ts" },
// ]
```

### Generate a project scaffold

```ts
import { emit, root, dir, file, write } from "@ilyeshdz/ts-plate";

const scaffold = root(
  dir(
    "my-package",
    file("package.json", {
      name: "my-package",
      version: "0.0.1",
      type: "module",
    }),
    file("tsconfig.json", {
      compilerOptions: { strict: true, target: "ESNext" },
    }),
    dir("src", file("index.ts", "export const greet = (name: string) => `Hello ${name}`;")),
    dir("tests", file("greet.test.ts")),
  ),
);

await write(await emit(scaffold), "./output");
// Creates the full directory structure on disk
```

### Multiple roots

```ts
const a = root(file("a.txt", "aaa"));
const b = root(file("b.txt", "bbb"));

await emit(a, b);
// [
//   { type: "file", path: "a.txt", content: "aaa" },
//   { type: "file", path: "b.txt", content: "bbb" },
// ]
```

### Deep nesting

```ts
const deep = root(dir("a", dir("b", dir("c", file("x.txt", "deep")))));
await emit(deep);
// [
//   { type: "dir",  path: "a" },
//   { type: "dir",  path: "a/b" },
//   { type: "dir",  path: "a/b/c" },
//   { type: "file", path: "a/b/c/x.txt", content: "deep" },
// ]
```

### Lazy file content

File content can be a function evaluated at emit time:

```ts
import { emit, file } from "@ilyeshdz/ts-plate";

const node = file("greeting.txt", () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : "Good afternoon";
});

await emit(node);
// [{ type: "file", path: "greeting.txt", content: "Good morning" }]
```

The function is only called when `emit()` runs — if you never call `emit()`, the function is never invoked.

Content functions also support `async`/`await`:

```ts
import { emit, file } from "@ilyeshdz/ts-plate";

const node = file("readme.md", async () => {
  const response = await fetch("https://api.example.com/docs");
  return response.text();
});

const [output] = await emit(node);
```

### Conditional nodes

```ts
import { emit, root, dir, file, when } from "@ilyeshdz/ts-plate";

const tree = root(
  file("index.ts"),
  when(true, dir("types", file("types.ts"))), // included
  when(false, file("unused.ts")), // skipped
  when(() => opts.typescript, file("tsconfig.json")), // lazy condition
);

const outputs = await emit(tree);
// [
//   { type: "file", path: "index.ts" },
//   { type: "dir",  path: "types" },
//   { type: "file", path: "types/types.ts" },
// ]
```

The `condition` accepts a `boolean` or `() => boolean` for lazy evaluation.

## Development

```bash
npm install
npm run test
npm run build
```

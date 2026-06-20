# treekit

A lightweight library for building file trees declaratively.

## Install

```bash
npm install treekit
```

## API Overview

| Function                    | Description                         |
| --------------------------- | ----------------------------------- |
| `file(name, content?)`      | Create a file node                  |
| `dir(name, ...children)`    | Create a directory node             |
| `root(...children)`         | Create a root container             |
| `emit(...nodes)`            | Flatten tree(s) into output entries |
| `write(outputs, basePath?)` | Write outputs to disk               |

## Usage

### Basic file tree

```ts
import { emit, root, dir, file } from "treekit";

const tree = root(
  dir("src", file("index.ts", `console.log("hello")`), dir("utils", file("helpers.ts"))),
);

const outputs = emit(tree);
// [
//   { type: "dir",  path: "src" },
//   { type: "file", path: "src/index.ts",    content: 'console.log("hello")' },
//   { type: "dir",  path: "src/utils" },
//   { type: "file", path: "src/utils/helpers.ts" },
// ]
```

### Generate a project scaffold

```ts
import { emit, root, dir, file, write } from "treekit";

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

await write(emit(scaffold), "./output");
// Creates the full directory structure on disk
```

### Multiple roots

```ts
const a = root(file("a.txt", "aaa"));
const b = root(file("b.txt", "bbb"));

emit(a, b);
// [
//   { type: "file", path: "a.txt", content: "aaa" },
//   { type: "file", path: "b.txt", content: "bbb" },
// ]
```

### Deep nesting

```ts
const deep = root(dir("a", dir("b", dir("c", file("x.txt", "deep")))));
emit(deep);
// [
//   { type: "dir",  path: "a" },
//   { type: "dir",  path: "a/b" },
//   { type: "dir",  path: "a/b/c" },
//   { type: "file", path: "a/b/c/x.txt", content: "deep" },
// ]
```

## Development

```bash
npm install
npm run test
npm run build
```

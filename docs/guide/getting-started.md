# Getting Started

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

## Files

Create a file node with a name and optional content.

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

`emit()` walks the tree and returns a flat array. Nothing hits the filesystem yet.

```ts
[{ type: "file", path: "hello.txt", content: "Hello, world!" }];
```

Content can also be a JSON object or a function:

```ts
file("package.json", { name: "my-app", version: "1.0.0" });
file("timestamp.txt", () => new Date().toISOString());
file("data.json", async () => {
  const res = await fetch("https://api.example.com/data");
  return res.json();
});
```

Function content is lazy. It runs during emit, not when you build the tree.

### Dynamic Filenames

Filenames can be computed lazily, just like file contents.

Pass a function (sync or async) instead of a string to `file()`:

```ts
file(() => `${packageName}.config.ts`, {});
```

```ts
file(async () => {
  const pkg = await fetchPackage();
  return `${pkg.name}.json`;
}, pkg);
```

The filename is resolved during emit, not when the tree is built. This keeps the tree declarative.

Filename evaluation happens **before** content evaluation. If the resolved filename is invalid, content is never resolved — preventing expensive work.

Resolved filenames are validated:

| Rule              | Example               | Reason                   |
| ----------------- | --------------------- | ------------------------ |
| Non-empty         | `() => ""`            | Empty path segment       |
| Non-whitespace    | `() => "  "`          | Only whitespace          |
| No path traversal | `() => "../secret"`   | Escapes target directory |
| Relative only     | `() => "/etc/passwd"` | Absolute path            |

All combinations of static/dynamic names and contents work together:

```ts
file("static.txt", "static content");
file("static.txt", () => "lazy content");
file("static.txt", async () => "async content");

file(() => "dynamic.txt", "static content");
file(
  () => "dynamic.txt",
  () => "lazy content",
);
file(
  () => "dynamic.txt",
  async () => "async content",
);

file(async () => "async-name.txt", "static content");
file(
  async () => "async-name.txt",
  () => "lazy content",
);
file(
  async () => "async-name.txt",
  async () => "async content",
);
```

Here is a realistic example using dynamic filenames:

```ts
const packageName = "my-lib";

const tree = root(
  dir(
    "packages",

    file(() => `${packageName}.package.json`, {
      name: packageName,
      version: "1.0.0",
    }),

    file(() => `${packageName}.README.md`, `# ${packageName}`),
  ),
);
```

## Write

Pass the outputs to `write()` when you're ready.

```ts
import { write } from "@ilyeshdz/ts-plate";

await write(outputs);
await write(outputs, "./output");
```

The optional base path lets you target a specific directory.

## Directories

`dir()` groups children under a folder.

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

The output is deterministic. Directories come before their children, depth-first, insertion order preserved.

```ts
[
  { type: "dir", path: "project" },
  { type: "file", path: "project/README.md", content: "# My Project" },
  { type: "dir", path: "project/src" },
  { type: "file", path: "project/src/index.ts", content: 'console.log("hello")' },
];
```

## Root

`root()` groups entries at the top level without adding a path segment.

```ts
const tree = root(file(".gitignore", "node_modules\n"), dir("src", file("index.ts")), dir("tests"));
```

Pass multiple roots to `emit()` to assemble a project from independent pieces.

```ts
const config = root(file(".gitignore", "node_modules\n"));
const source = root(dir("src", file("index.ts")));

const outputs = await emit(config, source);
```

## Render

`render()` calls emit and write in one shot.

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render(
  [root(dir("project", file("index.ts", `console.log("hi")`)))],
  "./out",
);
```

You still get the outputs back.

## Conditions

`when()` includes children only when the condition passes.

```ts
import { when, root, file, emit } from "@ilyeshdz/ts-plate";

const opts = { debug: true };

const tree = root(
  file("index.ts"),
  when(true, file("always-included.ts")),
  when(false, file("never-included.ts")),
  when(() => opts.debug, file("debug.log")),
);

const outputs = await emit(tree);
```

The condition can be a boolean or a function. Functions run at emit time.

## Copy

`copy()` brings an external file into the tree. The actual copy happens during write.

```ts
import { copy, root, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(copy("/absolute/path/to/LICENSE", "LICENSE"));
const outputs = await emit(tree);
await write(outputs);
```

## Conflict Strategies

ts-plate can scaffold into existing projects safely by controlling how files behave when they already exist.

By default, files are overwritten without warning. Pass a `strategy` option to `file()` to change this.

```ts
import { file } from "@ilyeshdz/ts-plate";

file("README.md", "# Hello", { strategy: "skip" });
file("package.json", { name: "my-app" }, { strategy: "merge" });
file("tsconfig.json", { compilerOptions: { strict: true } }, { strategy: "overwrite" });
```

### Strategies

| Strategy    | Existing file | Result     |
| ----------- | ------------- | ---------- |
| `overwrite` | yes           | replaced   |
| `skip`      | yes           | untouched  |
| `error`     | yes           | throws     |
| `merge`     | yes           | deep merge |

- **`overwrite`** (default) — always replace the existing file.
- **`skip`** — leave the existing file untouched.
- **`error`** — throw an error if the file exists.
- **`merge`** — deep-merge JSON objects when the file already exists. Generated values take precedence on conflicts. Arrays are replaced entirely. Throws a descriptive error if either side is not a JSON object.

### Merge example

Existing `package.json`:

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

Generated tree:

```ts
file(
  "package.json",
  {
    scripts: {
      dev: "vite",
    },
  },
  { strategy: "merge" },
);
```

Result:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "vite"
  }
}
```

### Realistic example

```ts
import { render, root, dir, file } from "@ilyeshdz/ts-plate";

const outputs = await render(
  root(
    dir(
      "my-app",

      file(
        "package.json",
        {
          scripts: {
            dev: "vite",
          },
        },
        {
          strategy: "merge",
        },
      ),

      file("README.md", "# My App", {
        strategy: "skip",
      }),
    ),
  ),
);
```

Conflict strategies make ts-plate a safe scaffolding tool for both new and existing projects.

## Composition

Trees are just data. Wrap them in functions and compose freely.

```ts
import { dir, file, type Node } from "@ilyeshdz/ts-plate";

function component(name: string): Node {
  return dir(
    name,
    file(`${name}.tsx`, `export function ${name}() { return null; }`),
    file(`${name}.test.tsx`, `import { describe, it } from "vitest";`),
  );
}

const app = root(dir("src", component("Button"), component("Card"), component("Modal")));
```

## Dry run

Emit returns data, so you can show the user a preview.

```ts
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(dir("output", file("data.txt", "hello")));
const outputs = await emit(tree);

for (const output of outputs) {
  const icon = output.type === "dir" ? "📁" : "📄";
  console.log(`  ${icon} ${output.path}`);
}
```

## Transform outputs

The emitted array is yours to modify.

```ts
import { emit, write, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(dir("build", file("output.txt", "data")));
let outputs = await emit(tree);

outputs = outputs.map((o) => ({ ...o, path: `release/${o.path}` }));
outputs = outputs.filter((o) => o.type !== "dir");

await write(outputs);
```

## Inline a CLI

Embed ts-plate inside your own CLI tool.

```ts
import { createInterface } from "node:readline/promises";
import { render, root, dir, file, when } from "@ilyeshdz/ts-plate";

const rl = createInterface({ input: process.stdin, output: process.stdout });

const name = await rl.question("Project name: ");
const useTs = (await rl.question("TypeScript? (y/n): ")).toLowerCase() === "y";
const includeTests = (await rl.question("Tests? (y/n): ")).toLowerCase() === "y";

rl.close();

const outputs = await render(
  root(
    dir(
      name,
      file("README.md", `# ${name}`),
      file("package.json", {
        name,
        version: "0.1.0",
        devDependencies: useTs ? { typescript: "^5.0.0" } : {},
      }),
      when(useTs, file("tsconfig.json", { compilerOptions: { strict: true } })),
      when(includeTests, dir("tests", file("index.test.ts", ""))),
      dir("src", file(useTs ? "index.ts" : "index.js", "")),
    ),
  ),
);
```

The tree layer handles the filesystem. Prompts, validation, and flags are your own code.

## Snapshot testing

Emit returns plain data, so testing needs no mock filesystem.

```ts
import { describe, it, expect } from "vitest";
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

it("generates the expected structure", async () => {
  const tree = root(dir("src", file("index.ts", "console.log('hi')")));
  const outputs = await emit(tree);
  expect(outputs).toMatchSnapshot();
});
```

## Full example

```ts
import { render, root, dir, file, when, type Node } from "@ilyeshdz/ts-plate";

interface ScaffoldOptions {
  name: string;
  typescript?: boolean;
  tests?: boolean;
}

function nodePackage(name: string): Node {
  return dir(
    name,
    file("package.json", { name, version: "0.1.0", type: "module" }),
    dir("src", file("index.ts", "")),
  );
}

async function scaffold(opts: ScaffoldOptions) {
  const tree = root(
    dir(
      opts.name,
      file("README.md", `# ${opts.name}`),
      nodePackage(opts.name),
      when(
        opts.typescript,
        file("tsconfig.json", {
          compilerOptions: { strict: true, target: "ESNext" },
        }),
      ),
      when(opts.tests, dir("tests", file("index.test.ts", ""))),
    ),
  );
  return render(tree);
}

await scaffold({ name: "my-app", typescript: true, tests: true });
```

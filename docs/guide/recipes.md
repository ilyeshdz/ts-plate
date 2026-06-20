# Recipes

These are the patterns ts-plate is meant to support in the real world: reusable generators, dry runs, content transforms, and CLI workflows that stay easy to understand months later.

## A reusable generator function

The most natural way to use ts-plate is to wrap a tree in a function and reuse it:

```ts
import { dir, file, type Node } from "@ilyeshdz/ts-plate";

function nodePackage(name: string): Node {
  return dir(
    name,
    file("package.json", {
      name,
      version: "0.0.1",
      type: "module",
      scripts: { build: "tsc", test: "vitest" },
    }),
    file("tsconfig.json", {
      compilerOptions: { strict: true, target: "ESNext" },
    }),
    dir("src", file("index.ts", "")),
    dir("tests"),
  );
}
```

Then compose it wherever you need it:

```ts
const workspace = root(
  nodePackage("packages/core"),
  nodePackage("packages/utils"),
  nodePackage("packages/types"),
);
```

That is the library's sweet spot: small functions that produce predictable structure.

## Project scaffolding

Here is a more complete starter that mixes options, conditionals, and output rendering:

```ts
import { render, root, dir, file, when } from "@ilyeshdz/ts-plate";

interface ScaffoldOptions {
  name: string;
  typescript?: boolean;
  tests?: boolean;
}

async function scaffold(opts: ScaffoldOptions) {
  const tree = root(
    dir(
      opts.name,
      file("README.md", `# ${opts.name}\n\nA project.`),
      file("package.json", {
        name: opts.name,
        version: "0.1.0",
        type: "module",
        scripts: opts.tests ? { build: "tsc", test: "vitest" } : { build: "tsc" },
      }),
      dir("src", file(opts.typescript ? "index.ts" : "index.js", "")),
      when(opts.tests, dir("tests", file("index.test.ts", ""))),
    ),
  );

  return render(tree);
}
```

This is the pattern behind most serious generator tools: ask for a few choices, build a tree, and let the library handle the filesystem part.

## Dry run before writing

Because `emit()` returns plain data, it is easy to show the user what will happen before anything is written:

```ts
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(dir("output", file("data.txt", "hello"), file("config.json", { debug: true })));
const outputs = await emit(tree);

for (const output of outputs) {
  if (output.type === "file") {
    console.log(`FILE  ${output.path}`);
  } else {
    console.log(`DIR   ${output.path}`);
  }
}
```

That kind of preview is one of the nicest things you can offer in a custom CLI.

## Lazy content from an API

When output depends on external data, keep the fetch inside the node:

```ts
import { root, dir, file, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "docs",
    file("readme.md", async () => {
      const res = await fetch("https://api.github.com/repos/user/project/readme");
      const data = await res.json();
      return Buffer.from(data.content, "base64").toString();
    }),
  ),
);

const outputs = await emit(tree);
await write(outputs);
```

This keeps your generator logic localized. The tree still describes the shape of the project, even when the content itself comes from somewhere else.

## Multi-root output

Sometimes you want more than one top-level tree:

```ts
import { emit, root, file, dir } from "@ilyeshdz/ts-plate";

const configFiles = root(
  file(".gitignore", "node_modules\ndist\n"),
  file(".npmrc", "registry=https://registry.npmjs.org/"),
);

const sourceFiles = root(dir("src", file("index.ts")), dir("tests"));

const allOutputs = await emit(configFiles, sourceFiles);
```

This is useful for generators that assemble a workspace from several independent pieces.

## A simple interactive CLI

ts-plate is often most valuable when it is embedded inside your own CLI:

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
        type: "module",
        devDependencies: useTs ? { typescript: "^5.0.0" } : {},
      }),
      when(useTs, file("tsconfig.json", { compilerOptions: { strict: true } })),
      when(includeTests, dir("tests", file("index.test.ts", ""))),
      dir("src", file(useTs ? "index.ts" : "index.js", "")),
    ),
  ),
);

console.log(`Created ${outputs.length} entries.`);
```

The important part here is not the prompts. It is the fact that the same tree can be used for preview, validation, and writing.

## Transforming outputs before writing

Since `emit()` returns an array, you can transform it however you want:

```ts
import { emit, write, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(dir("build", file("output.txt", "data")));
let outputs = await emit(tree);

outputs = outputs.map((o) => ({
  ...o,
  path: `project-${Date.now()}/${o.path}`,
}));

outputs = outputs.filter((o) => o.type !== "dir");

await write(outputs);
```

That pattern is especially useful when you want to enforce naming rules, inject a release prefix, or send the outputs through an additional validation step before touching disk.

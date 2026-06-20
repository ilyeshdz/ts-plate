# Recipes

Practical patterns for using ts-plate in real scenarios.

## Custom generator function

Wrap a tree in a function and reuse it across projects:

```ts
import { dir, file, type Node } from "@ilyeshdz/ts-plate";

function nodePackage(name: string): Node {
  return dir(name,
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

Then use it anywhere:

```ts
const workspace = root(
  nodePackage("packages/core"),
  nodePackage("packages/utils"),
  nodePackage("packages/types"),
);
```

## Project scaffold

Generate a full project with a single tree:

```ts
import { render, root, dir, file, when } from "@ilyeshdz/ts-plate";

interface ScaffoldOptions {
  name: string;
  typescript?: boolean;
  tests?: boolean;
}

async function scaffold(opts: ScaffoldOptions) {
  const tree = root(
    dir(opts.name,
      file("README.md", `# ${opts.name}\n\nA project.`),
      file("package.json", {
        name: opts.name,
        version: "0.1.0",
        type: "module",
        scripts: opts.tests
          ? { build: "tsc", test: "vitest" }
          : { build: "tsc" },
      }),
      dir("src",
        file(opts.typescript ? "index.ts" : "index.js", ""),
      ),
      when(opts.tests,
        dir("tests", file("index.test.ts", "")),
      ),
    ),
  );

  return render(tree);
}

await scaffold({ name: "my-app", typescript: true, tests: true });
```

## Dry run

Inspect what would be written before writing:

```ts
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(
  dir("output",
    file("data.txt", "hello"),
    file("config.json", { debug: true }),
  ),
);

const outputs = await emit(tree);

console.log("Plan:");
for (const o of outputs) {
  if (o.type === "file") {
    console.log(`  📄 ${o.path} (${o.content?.length ?? 0} chars)`);
  } else {
    console.log(`  📁 ${o.path}`);
  }
}
```

## Lazy content from an API

Generate files whose content comes from an external source:

```ts
import { root, dir, file, emit, write } from "@ilyeshdz/ts-plate";

const tree = root(
  dir("docs",
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

## Multi-root output

Emit multiple independent trees into a single flat list:

```ts
import { emit, root, file } from "@ilyeshdz/ts-plate";

const configFiles = root(
  file(".gitignore", "node_modules\ndist\n"),
  file(".npmrc", "registry=https://registry.npmjs.org/"),
);

const sourceFiles = root(
  dir("src", file("index.ts")),
  dir("tests"),
);

// Combine both trees
const allOutputs = await emit(configFiles, sourceFiles);
// [
//   { type: "file", path: ".gitignore", ... },
//   { type: "file", path: ".npmrc", ... },
//   { type: "dir",  path: "src" },
//   { type: "file", path: "src/index.ts", ... },
//   { type: "dir",  path: "tests" },
// ]
```

## Interactive CLI scaffold

Build a simple CLI that asks questions and scaffolds files:

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
    dir(name,
      file("README.md", `# ${name}`),
      file("package.json", {
        name,
        version: "0.1.0",
        type: "module",
        devDependencies: useTs ? { typescript: "^5.0.0" } : {},
      }),
      when(useTs, file("tsconfig.json", { compilerOptions: { strict: true } })),
      when(includeTests,
        dir("tests", file("index.test.ts", "")),
      ),
      dir("src",
        file(useTs ? "index.ts" : "index.js", ""),
      ),
    ),
  ),
);

console.log(`Created ${outputs.length} entries.`);
```

## Transforming outputs before writing

Since outputs is just an array, you can transform it:

```ts
import { emit, write, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(dir("build", file("output.txt", "data")));
let outputs = await emit(tree);

// Prepend a base path to all outputs
outputs = outputs.map(o => ({
  ...o,
  path: `project-${Date.now()}/${o.path}`,
}));

// Filter out empty directories
outputs = outputs.filter(o => o.type !== "dir");

await write(outputs);
```

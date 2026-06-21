# Recipes

## Conditionally scaffold features

Use `when()` to include or exclude entire groups of files based on a config object.

```ts
function scaffold(name: string, opts: { ts?: boolean; test?: boolean }) {
  return root(
    dir(
      name,
      file("README.md", `# ${name}`),
      file("index.js", `console.log("hello")`),

      when(
        opts.ts,
        file("tsconfig.json", { compilerOptions: { strict: true } }),
        file("index.ts", `console.log("hello")`),
      ),

      when(opts.test, dir("tests", file("index.test.ts", ""))),
    ),
  );
}
```

## Generate trees from data

Map over an array to create files. Great for scaffolding from a config or schema.

```ts
function scaffoldRoutes(routes: { path: string; handler: string }[]) {
  return root(dir("routes", ...routes.map((r) => file(`${r.path}.ts`, r.handler))));
}
```

Wrap repeated patterns in a factory function:

```ts
function component(name: string) {
  return dir(
    name,
    file(`${name}.tsx`, `export function ${name}() { return null; }`),
    file(`${name}.test.tsx`, ""),
  );
}

const tree = root(dir("src", component("Button"), component("Card")));
```

## Snapshot testing

Emit returns plain data, so testing needs no mock filesystem.

```ts
import { expect, it } from "vitest";
import { file, emit } from "@ilyeshdz/ts-plate";

it("generates the expected output", async () => {
  const outputs = await emit(file("hello.txt", "Hello"));
  expect(outputs).toMatchSnapshot();
});
```

You can also assert on specific outputs:

```ts
expect(outputs).toContainEqual({
  type: "file",
  path: "my-app/tsconfig.json",
  content: JSON.stringify({ compilerOptions: { strict: true } }, null, 2),
  strategy: "overwrite",
});
```

## Dry run before writing

Since emit returns data, show the user a preview before anything hits disk.

```ts
const outputs = await emit(tree);

console.log("Files to create:");
outputs.forEach((o) => console.log(`  ${o.path}`));

// Modify the array before writing
const filtered = outputs.filter((o) => !o.path.startsWith("."));
await write(filtered);
```

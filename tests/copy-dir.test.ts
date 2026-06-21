import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { copy, dir, emit, file, render, root, when } from "../src";

afterEach(() => {
  vol.reset();
});

test("copies a simple folder", async () => {
  vol.fromJSON({
    "/templates/README.md": "# Template",
    "/templates/index.ts": "console.log('hi')",
  });

  expect(await emit(copy("/templates"))).toEqual([
    { type: "copy", path: "README.md", from: "/templates/README.md" },
    { type: "copy", path: "index.ts", from: "/templates/index.ts" },
  ]);
});

test("copies nested folder structure", async () => {
  vol.fromJSON({
    "/templates/src/index.ts": "console.log('hi')",
    "/templates/src/utils/helpers.ts": "export const add = (a: number, b: number) => a + b",
    "/templates/README.md": "# Template",
  });

  expect(await emit(copy("/templates"))).toEqual([
    { type: "copy", path: "README.md", from: "/templates/README.md" },
    { type: "dir", path: "src" },
    { type: "copy", path: "src/index.ts", from: "/templates/src/index.ts" },
    { type: "dir", path: "src/utils" },
    {
      type: "copy",
      path: "src/utils/helpers.ts",
      from: "/templates/src/utils/helpers.ts",
    },
  ]);
});

test("copies into nested directory node", async () => {
  vol.fromJSON({
    "/templates/Button.tsx": "export function Button() { return null; }",
    "/templates/index.ts": "export { Button } from './Button'",
  });

  const tree = root(dir("components", copy("/templates")));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "components" },
    { type: "copy", path: "components/Button.tsx", from: "/templates/Button.tsx" },
    { type: "copy", path: "components/index.ts", from: "/templates/index.ts" },
  ]);
});

test("applies rename transformation", async () => {
  vol.fromJSON({
    "/templates/__name__.ts": "const x = 1",
    "/templates/__name__.test.ts": "test('x', () => {})",
  });

  const outputs = await emit(
    copy("/templates", {
      rename: (name: string) => name.replace(/__name__/g, "my-app"),
    }),
  );

  expect(outputs).toHaveLength(2);
  expect(outputs).toContainEqual({
    type: "copy",
    path: "my-app.ts",
    from: "/templates/__name__.ts",
  });
  expect(outputs).toContainEqual({
    type: "copy",
    path: "my-app.test.ts",
    from: "/templates/__name__.test.ts",
  });
});

test("filters entries with filter option", async () => {
  vol.fromJSON({
    "/templates/src/index.ts": "console.log('hi')",
    "/templates/src/test.log": "this should be excluded",
    "/templates/README.md": "# Template",
    "/templates/node_modules/pkg/index.js": "should be excluded",
  });

  const outputs = await emit(
    copy("/templates", {
      filter: (path: string) => !path.includes("node_modules") && !path.endsWith(".log"),
    }),
  );

  expect(outputs).toEqual([
    { type: "copy", path: "README.md", from: "/templates/README.md" },
    { type: "dir", path: "src" },
    { type: "copy", path: "src/index.ts", from: "/templates/src/index.ts" },
  ]);
});

test("preserves empty directory", async () => {
  vol.mkdirSync("/templates", { recursive: true });
  vol.mkdirSync("/templates/empty-dir");
  vol.writeFileSync("/templates/README.md", "# Template");

  const outputs = await emit(copy("/templates"));

  expect(outputs).toContainEqual({ type: "dir", path: "empty-dir" });
  expect(outputs).toContainEqual({ type: "copy", path: "README.md", from: "/templates/README.md" });
});

test("supports mixed copy-dir with programmatic nodes", async () => {
  vol.fromJSON({
    "/templates/src/index.ts": "console.log('hi')",
  });

  const tree = root(file("README.md", "# Project"), dir("lib", copy("/templates")));

  expect(await emit(tree)).toEqual([
    { type: "file", path: "README.md", content: "# Project" },
    { type: "dir", path: "lib" },
    { type: "dir", path: "lib/src" },
    { type: "copy", path: "lib/src/index.ts", from: "/templates/src/index.ts" },
  ]);
});

test("integration with render writes files to disk", async () => {
  vol.fromJSON({
    "/templates/README.md": "# Template",
    "/templates/src/index.ts": "console.log('hi')",
  });

  await render([root(dir("output", copy("/templates")))], "/");

  expect(fs.readFileSync("/output/README.md", "utf-8")).toBe("# Template");
  expect(fs.readFileSync("/output/src/index.ts", "utf-8")).toBe("console.log('hi')");
  expect(fs.statSync("/output/src").isDirectory()).toBe(true);
});

test("works with when() condition", async () => {
  vol.fromJSON({
    "/templates/README.md": "# Template",
  });

  const tree = root(when(true, copy("/templates")), when(false, copy("/nonexistent")));

  const outputs = await emit(tree);

  expect(outputs).toEqual([{ type: "copy", path: "README.md", from: "/templates/README.md" }]);
});

test("throws on unreadable directory", async () => {
  await expect(emit(copy("/nonexistent"))).rejects.toThrow();
});

test("copies with rename and filter combined", async () => {
  vol.fromJSON({
    "/templates/__name__.ts": "const x = 1",
    "/templates/__name__.test.ts": "test('x', () => {})",
    "/templates/_internal.ts": "export const internal = true",
    "/templates/node_modules/pkg/index.js": "hidden",
  });

  const outputs = await emit(
    copy("/templates", {
      rename: (name: string) => name.replace(/__name__/g, "app"),
      filter: (path: string) => !path.includes("node_modules") && !path.includes("/_internal"),
    }),
  );

  expect(outputs).toHaveLength(2);
  expect(outputs).toContainEqual({ type: "copy", path: "app.ts", from: "/templates/__name__.ts" });
  expect(outputs).toContainEqual({
    type: "copy",
    path: "app.test.ts",
    from: "/templates/__name__.test.ts",
  });
});

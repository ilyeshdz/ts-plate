import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { copy, dir, emit, render, root } from "../src";

afterEach(() => {
  vol.reset();
});

test("copy file and directory nodes through emit", async () => {
  vol.fromJSON({
    "/source/app.ts": "export const x = 1",
    "/templates/README.md": "# Template",
    "/templates/src/index.ts": "console.log('hi')",
  });

  const tree = root(
    copy("/source/app.ts", "lib/app.ts"),
    dir(
      "output",
      copy("/templates", {
        rename: (n: string) => n.replace(".md", ".txt"),
        filter: (p: string) => !p.includes("node_modules"),
      }),
    ),
  );

  const outputs = await emit(tree);

  expect(outputs).toContainEqual({
    type: "copy",
    path: "lib/app.ts",
    from: "/source/app.ts",
  });
  expect(outputs).toContainEqual({
    type: "copy",
    path: "output/README.txt",
    from: "/templates/README.md",
  });
  expect(outputs).toContainEqual({
    type: "copy",
    path: "output/src/index.ts",
    from: "/templates/src/index.ts",
  });
});

test("copy-dir writes files to disk through render", async () => {
  vol.fromJSON({
    "/templates/README.md": "# Template",
    "/templates/src/index.ts": "console.log('hi')",
  });

  await render("/", root(dir("output", copy("/templates"))));

  expect(fs.readFileSync("/output/README.md", "utf-8")).toBe("# Template");
  expect(fs.readFileSync("/output/src/index.ts", "utf-8")).toBe("console.log('hi')");
  expect(fs.statSync("/output/src").isDirectory()).toBe(true);
});

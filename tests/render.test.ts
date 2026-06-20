import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { dir, file, render, root } from "../src";

afterEach(() => {
  vol.reset();
});

test("writes a tree to disk and returns outputs", async () => {
  const outputs = await render([root(dir("src", file("index.ts", "hi")))], "/");

  expect(outputs).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts", content: "hi" },
  ]);
  expect(fs.readFileSync("/src/index.ts", "utf-8")).toBe("hi");
});

test("writes at custom basePath", async () => {
  await render([file("readme.md", "# hello")], "/output");

  expect(fs.readFileSync("/output/readme.md", "utf-8")).toBe("# hello");
});

test("creates intermediate directories", async () => {
  await render([root(dir("a", dir("b", file("c.txt", "deep"))))], "/");

  expect(fs.statSync("/a/b").isDirectory()).toBe(true);
  expect(fs.readFileSync("/a/b/c.txt", "utf-8")).toBe("deep");
});

test("writes copy nodes to disk", async () => {
  fs.writeFileSync("/source.js", "export const x = 1");

  await render([file("dest.js", "placeholder")], "/");

  expect(fs.readFileSync("/dest.js", "utf-8")).toBe("placeholder");
});

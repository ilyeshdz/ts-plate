import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { copy, dir, emit, file, root, write } from "../src";

afterEach(() => {
  vol.reset();
});

test("copy creates a copy node", () => {
  expect(copy("/source/app.ts", "app.ts")).toEqual({
    type: "copy",
    from: "/source/app.ts",
    name: "app.ts",
  });
});

test("emit with a copy node at root level", () => {
  expect(emit(copy("/source/app.ts", "app.ts"))).toEqual([
    { type: "copy", path: "app.ts", from: "/source/app.ts" },
  ]);
});

test("emit with a copy node nested inside a directory", () => {
  const tree = root(dir("src", copy("/source/app.ts", "app.ts")));

  expect(emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "copy", path: "src/app.ts", from: "/source/app.ts" },
  ]);
});

test("emit with copy node alongside files and dirs", () => {
  const tree = root(
    file("readme.md", "# Hello"),
    copy("/source/data.json", "data.json"),
    dir("lib", file("index.ts")),
  );

  expect(emit(tree)).toEqual([
    { type: "file", path: "readme.md", content: "# Hello" },
    { type: "copy", path: "data.json", from: "/source/data.json" },
    { type: "dir", path: "lib" },
    { type: "file", path: "lib/index.ts" },
  ]);
});

test("write copies a file from source to destination", async () => {
  fs.writeFileSync("/source.txt", "content to copy");

  await write([{ type: "copy", path: "dest.txt", from: "/source.txt" }], "/");

  expect(fs.readFileSync("/dest.txt", "utf-8")).toBe("content to copy");
});

test("write copies a file into a nested directory", async () => {
  fs.writeFileSync("/source.js", "export const x = 1");

  await write([{ type: "copy", path: "src/lib/util.js", from: "/source.js" }], "/");

  expect(fs.statSync("/src/lib").isDirectory()).toBe(true);
  expect(fs.readFileSync("/src/lib/util.js", "utf-8")).toBe("export const x = 1");
});

test("write with copy alongside files and directories", async () => {
  fs.writeFileSync("/external.css", "body { margin: 0 }");

  const outputs = [
    { type: "dir" as const, path: "public" },
    { type: "copy" as const, path: "public/style.css", from: "/external.css" },
    { type: "file" as const, path: "public/index.html", content: "<html></html>" },
  ];

  await write(outputs, "/");

  expect(fs.readFileSync("/public/style.css", "utf-8")).toBe("body { margin: 0 }");
  expect(fs.readFileSync("/public/index.html", "utf-8")).toBe("<html></html>");
});

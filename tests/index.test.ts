import { expect, test } from "vitest";
import { dir, file, plate, root } from "../src";

test("file creates a file node", () => {
  expect(file("index.ts")).toEqual({ type: "file", name: "index.ts" });

  expect(file("app.ts", 'export const a = 1')).toEqual({
    type: "file",
    name: "app.ts",
    content: 'export const a = 1',
  });
});

test("file allows Record<string, any> content", () => {
  const content = { foo: 1, bar: { baz: true } };
  expect(file("data.json", content)).toEqual({
    type: "file",
    name: "data.json",
    content,
  });
});

test("dir creates a directory node", () => {
  expect(dir("src")).toEqual({ type: "dir", name: "src", children: [] });

  expect(dir("src", file("a.ts"), file("b.ts"))).toEqual({
    type: "dir",
    name: "src",
    children: [
      { type: "file", name: "a.ts" },
      { type: "file", name: "b.ts" },
    ],
  });
});

test("root creates a root node", () => {
  expect(root()).toEqual({ type: "root", children: [] });

  expect(root(dir("lib"), file("readme.md"))).toEqual({
    type: "root",
    children: [
      { type: "dir", name: "lib", children: [] },
      { type: "file", name: "readme.md" },
    ],
  });
});

test("root with nested directories and files", () => {
  const tree = root(
    dir(
      "src",
      file("index.ts", 'console.log("hi")'),
      dir("utils", file("helpers.ts", 'export const add = (a: number, b: number) => a + b')),
      dir("types", file("types.ts")),
    ),
  );

  expect(plate(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts", content: 'console.log("hi")' },
    { type: "dir", path: "src/utils" },
    { type: "file", path: "src/utils/helpers.ts", content: 'export const add = (a: number, b: number) => a + b' },
    { type: "dir", path: "src/types" },
    { type: "file", path: "src/types/types.ts" },
  ]);
});

test("single file at root level", () => {
  expect(plate(file("readme.md", "# Project"))).toEqual([
    { type: "file", path: "readme.md", content: "# Project" },
  ]);
});

test("single directory at root level", () => {
  expect(plate(dir("dist"))).toEqual([
    { type: "dir", path: "dist" },
  ]);
});

test("empty root produces no outputs", () => {
  expect(plate(root())).toEqual([]);
});

test("multiple roots are flattened together", () => {
  expect(plate(root(file("a.txt")), root(file("b.txt")))).toEqual([
    { type: "file", path: "a.txt" },
    { type: "file", path: "b.txt" },
  ]);
});

test("file with undefined content omits the content field", () => {
  expect(plate(file("empty.ts"))).toEqual([
    { type: "file", path: "empty.ts" },
  ]);
});

test("file with empty string content", () => {
  expect(plate(file("empty.ts", ""))).toEqual([
    { type: "file", path: "empty.ts", content: "" },
  ]);
});

test("deeply nested tree", () => {
  const tree = root(
    dir("a", dir("b", dir("c", file("d.txt", "deep")))),
  );

  expect(plate(tree)).toEqual([
    { type: "dir", path: "a" },
    { type: "dir", path: "a/b" },
    { type: "dir", path: "a/b/c" },
    { type: "file", path: "a/b/c/d.txt", content: "deep" },
  ]);
});

test("empty directory in the middle of a tree", () => {
  const tree = root(dir("empty"), dir("full", file("f.txt", "x")));

  expect(plate(tree)).toEqual([
    { type: "dir", path: "empty" },
    { type: "dir", path: "full" },
    { type: "file", path: "full/f.txt", content: "x" },
  ]);
});

test("JSON object content is preserved", () => {
  const pkg = { name: "ts-plate", version: "1.0.0" };
  expect(plate(file("package.json", pkg))).toEqual([
    { type: "file", path: "package.json", content: pkg },
  ]);
});

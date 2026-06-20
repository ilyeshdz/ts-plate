import { expect, test } from "vitest";
import { dir, file, emit, root } from "../src";

test("root with nested directories and files", async () => {
  const tree = root(
    dir(
      "src",
      file("index.ts", 'console.log("hi")'),
      dir("utils", file("helpers.ts", "export const add = (a: number, b: number) => a + b")),
      dir("types", file("types.ts")),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts", content: 'console.log("hi")' },
    { type: "dir", path: "src/utils" },
    {
      type: "file",
      path: "src/utils/helpers.ts",
      content: "export const add = (a: number, b: number) => a + b",
    },
    { type: "dir", path: "src/types" },
    { type: "file", path: "src/types/types.ts" },
  ]);
});

test("single file at root level", async () => {
  expect(await emit(file("readme.md", "# Project"))).toEqual([
    { type: "file", path: "readme.md", content: "# Project" },
  ]);
});

test("single directory at root level", async () => {
  expect(await emit(dir("dist"))).toEqual([{ type: "dir", path: "dist" }]);
});

test("empty root produces no outputs", async () => {
  expect(await emit(root())).toEqual([]);
});

test("multiple roots are flattened together", async () => {
  expect(await emit(root(file("a.txt")), root(file("b.txt")))).toEqual([
    { type: "file", path: "a.txt" },
    { type: "file", path: "b.txt" },
  ]);
});

test("file with undefined content omits the content field", async () => {
  expect(await emit(file("empty.ts"))).toEqual([{ type: "file", path: "empty.ts" }]);
});

test("file with empty string content", async () => {
  expect(await emit(file("empty.ts", ""))).toEqual([
    { type: "file", path: "empty.ts", content: "" },
  ]);
});

test("deeply nested tree", async () => {
  const tree = root(dir("a", dir("b", dir("c", file("d.txt", "deep")))));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "a" },
    { type: "dir", path: "a/b" },
    { type: "dir", path: "a/b/c" },
    { type: "file", path: "a/b/c/d.txt", content: "deep" },
  ]);
});

test("empty directory in the middle of a tree", async () => {
  const tree = root(dir("empty"), dir("full", file("f.txt", "x")));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "empty" },
    { type: "dir", path: "full" },
    { type: "file", path: "full/f.txt", content: "x" },
  ]);
});

test("JSON object content is preserved", async () => {
  const pkg = { name: "ts-plate", version: "1.0.0" };
  expect(await emit(file("package.json", pkg))).toEqual([
    { type: "file", path: "package.json", content: pkg },
  ]);
});

test("file with function content is evaluated at emit time", async () => {
  expect(await emit(file("name.ts", () => "evaluated content"))).toEqual([
    { type: "file", path: "name.ts", content: "evaluated content" },
  ]);
});

test("file with function returning object content", async () => {
  const obj = { key: "value" };
  expect(await emit(file("data.json", () => obj))).toEqual([
    { type: "file", path: "data.json", content: obj },
  ]);
});

test("file with async function content", async () => {
  expect(await emit(file("async.txt", async () => "async content"))).toEqual([
    { type: "file", path: "async.txt", content: "async content" },
  ]);
});

test("async function returning object content", async () => {
  const obj = { key: "value" };
  expect(await emit(file("data.json", async () => obj))).toEqual([
    { type: "file", path: "data.json", content: obj },
  ]);
});

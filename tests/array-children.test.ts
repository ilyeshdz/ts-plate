import { expect, test } from "vitest";
import { dir, file, emit, root, when } from "../src";

test("flat variadic children still work", async () => {
  const tree = root(dir("src", file("a.ts", "a"), file("b.ts", "b")));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts", content: "a" },
    { type: "file", path: "src/b.ts", content: "b" },
  ]);
});

test("array children with emit", async () => {
  const tree = root(dir("src", [file("a.ts", "a"), file("b.ts", "b")]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts", content: "a" },
    { type: "file", path: "src/b.ts", content: "b" },
  ]);
});

test("nested arrays with emit", async () => {
  const tree = root(dir("src", [file("a.ts"), dir("nested", [file("c.ts")])]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts" },
    { type: "dir", path: "src/nested" },
    { type: "file", path: "src/nested/c.ts" },
  ]);
});

test("deeply nested arrays with emit", async () => {
  const tree = root(dir("src", [[[file("a.ts"), [file("b.ts")]]]]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts" },
    { type: "file", path: "src/b.ts" },
  ]);
});

test("mixed variadic and array children", async () => {
  const tree = root(dir("src", file("a.ts"), [file("b.ts"), file("c.ts")], file("d.ts")));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts" },
    { type: "file", path: "src/b.ts" },
    { type: "file", path: "src/c.ts" },
    { type: "file", path: "src/d.ts" },
  ]);
});

test("empty array produces no children", async () => {
  const tree = root(dir("empty", []));

  expect(await emit(tree)).toEqual([{ type: "dir", path: "empty" }]);
});

test("array children at root level", async () => {
  const tree = root([file("a.txt"), dir("lib", file("b.ts"))]);

  expect(await emit(tree)).toEqual([
    { type: "file", path: "a.txt" },
    { type: "dir", path: "lib" },
    { type: "file", path: "lib/b.ts" },
  ]);
});

test("when() inside array children", async () => {
  const tree = root(dir("src", [when(true, file("active.ts")), when(false, file("inactive.ts"))]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/active.ts" },
  ]);
});

test("async file content unaffected by array children", async () => {
  const tree = root(dir("src", [file("async.txt", async () => "async content")]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/async.txt", content: "async content" },
  ]);
});

test("dynamic filenames inside array children", async () => {
  const tree = root(dir("src", [file(() => "dynamic.txt", "content")]));

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/dynamic.txt", content: "content" },
  ]);
});

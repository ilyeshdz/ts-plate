import { expect, test } from "vitest";
import { dir, file, emit, root, when } from "../src";

test("when true includes children", () => {
  expect(emit(when(true, file("a.txt", "hello")))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("when false excludes children", () => {
  expect(emit(when(false, file("a.txt", "hello")))).toEqual([]);
});

test("when with lazy condition (true)", () => {
  expect(emit(when(() => true, file("a.txt")))).toEqual([{ type: "file", path: "a.txt" }]);
});

test("when with lazy condition (false)", () => {
  expect(emit(when(() => false, file("a.txt")))).toEqual([]);
});

test("when with multiple children", () => {
  expect(emit(when(true, file("a.txt"), file("b.txt")))).toEqual([
    { type: "file", path: "a.txt" },
    { type: "file", path: "b.txt" },
  ]);
});

test("when nested inside root", () => {
  expect(emit(root(when(true, dir("src", file("index.ts")))))).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts" },
  ]);
});

test("when false nested inside root", () => {
  expect(emit(root(when(false, dir("src", file("index.ts")))))).toEqual([]);
});

test("when inside directory children", () => {
  expect(emit(root(dir("src", when(true, file("a.ts")), when(false, file("b.ts")))))).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/a.ts" },
  ]);
});

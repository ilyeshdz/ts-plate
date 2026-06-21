import { expect, test } from "vitest";
import { dir, file } from "../src";

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

test("dir accepts array children", () => {
  expect(dir("src", [file("a.ts"), file("b.ts")])).toEqual({
    type: "dir",
    name: "src",
    children: [
      { type: "file", name: "a.ts" },
      { type: "file", name: "b.ts" },
    ],
  });
});

test("dir accepts nested arrays", () => {
  expect(dir("src", [[file("a.ts"), file("b.ts")]])).toEqual({
    type: "dir",
    name: "src",
    children: [
      { type: "file", name: "a.ts" },
      { type: "file", name: "b.ts" },
    ],
  });
});

test("dir accepts deeply nested arrays", () => {
  expect(dir("src", [[[file("a.ts")]]])).toEqual({
    type: "dir",
    name: "src",
    children: [{ type: "file", name: "a.ts" }],
  });
});

test("dir accepts empty array", () => {
  expect(dir("src", [])).toEqual({
    type: "dir",
    name: "src",
    children: [],
  });
});

test("dir accepts mixed variadic and array children", () => {
  expect(dir("src", file("a.ts"), [file("b.ts"), file("c.ts")], file("d.ts"))).toEqual({
    type: "dir",
    name: "src",
    children: [
      { type: "file", name: "a.ts" },
      { type: "file", name: "b.ts" },
      { type: "file", name: "c.ts" },
      { type: "file", name: "d.ts" },
    ],
  });
});

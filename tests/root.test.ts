import { expect, test } from "vitest";
import { dir, file, root } from "../src";

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

test("root accepts array children", () => {
  expect(root([dir("lib"), file("readme.md")])).toEqual({
    type: "root",
    children: [
      { type: "dir", name: "lib", children: [] },
      { type: "file", name: "readme.md" },
    ],
  });
});

test("root accepts nested arrays", () => {
  expect(root([[dir("lib"), file("readme.md")]])).toEqual({
    type: "root",
    children: [
      { type: "dir", name: "lib", children: [] },
      { type: "file", name: "readme.md" },
    ],
  });
});

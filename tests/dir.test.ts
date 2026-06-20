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

import { expect, test } from "vitest";
import { file } from "../src";

test("file creates a file node", () => {
  expect(file("index.ts")).toEqual({ type: "file", name: "index.ts" });

  expect(file("app.ts", "export const a = 1")).toEqual({
    type: "file",
    name: "app.ts",
    content: "export const a = 1",
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

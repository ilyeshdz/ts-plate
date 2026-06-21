import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { file, render, write } from "../src";

afterEach(() => {
  vol.reset();
});

test("write creates files and directories", async () => {
  await write(
    [
      { type: "file" as const, path: "README.md", content: "# Hello" },
      { type: "dir" as const, path: "src" },
      { type: "file" as const, path: "src/index.ts", content: "export const x = 1" },
      { type: "file" as const, path: "src/data.json", content: { key: "value" } },
      { type: "file" as const, path: "src/empty.ts" },
    ],
    "/root",
  );

  expect(fs.readFileSync("/root/README.md", "utf-8")).toBe("# Hello");
  expect(fs.readFileSync("/root/src/index.ts", "utf-8")).toBe("export const x = 1");
  expect(fs.readFileSync("/root/src/data.json", "utf-8")).toBe(
    JSON.stringify({ key: "value" }, null, 2),
  );
  expect(fs.readFileSync("/root/src/empty.ts", "utf-8")).toBe("");
  expect(fs.statSync("/root/src").isDirectory()).toBe(true);
});

test("write with custom basePath", async () => {
  await write(
    [
      { type: "dir" as const, path: "sub" },
      { type: "file" as const, path: "sub/readme.md", content: "# hi" },
    ],
    "/custom",
  );

  expect(fs.readFileSync("/custom/sub/readme.md", "utf-8")).toBe("# hi");
});

test("render emits and writes in one call", async () => {
  const outputs = await render([file("hello.txt", "world")], "/root");

  expect(outputs).toEqual([{ type: "file", path: "hello.txt", content: "world" }]);
  expect(fs.readFileSync("/root/hello.txt", "utf-8")).toBe("world");
});

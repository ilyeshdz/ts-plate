import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { write } from "../src";

afterEach(() => {
  vol.reset();
});

test("writes a single file with string content", async () => {
  await write([{ type: "file", path: "file.txt", content: "hello" }], "/");

  expect(fs.readFileSync("/file.txt", "utf-8")).toBe("hello");
});

test("writes a single file with undefined content", async () => {
  await write([{ type: "file", path: "empty.txt" }], "/");

  expect(fs.readFileSync("/empty.txt", "utf-8")).toBe("");
});

test("writes a single file with object content as JSON", async () => {
  const obj = { name: "test", value: 42 };

  await write([{ type: "file", path: "data.json", content: obj }], "/");

  expect(fs.readFileSync("/data.json", "utf-8")).toBe(JSON.stringify(obj, null, 2));
});

test("creates a directory", async () => {
  await write([{ type: "dir", path: "mydir" }], "/");

  expect(fs.statSync("/mydir").isDirectory()).toBe(true);
});

test("writes nested files and directories", async () => {
  const outputs = [
    { type: "dir" as const, path: "src" },
    { type: "file" as const, path: "src/index.ts", content: 'console.log("hi")' },
    { type: "dir" as const, path: "src/utils" },
    { type: "file" as const, path: "src/utils/helpers.ts", content: "export const add = (a: number, b: number) => a + b" },
  ];

  await write(outputs, "/");

  expect(fs.statSync("/src").isDirectory()).toBe(true);
  expect(fs.statSync("/src/utils").isDirectory()).toBe(true);
  expect(fs.readFileSync("/src/index.ts", "utf-8")).toBe('console.log("hi")');
  expect(fs.readFileSync("/src/utils/helpers.ts", "utf-8")).toBe("export const add = (a: number, b: number) => a + b");
});

test("uses custom basePath", async () => {
  await write([{ type: "dir", path: "sub" }, { type: "file", path: "sub/readme.md", content: "# hi" }], "/custom");

  expect(fs.readFileSync("/custom/sub/readme.md", "utf-8")).toBe("# hi");
});

test("writes multiple outputs", async () => {
  await write([
    { type: "file", path: "a.txt", content: "aaa" },
    { type: "file", path: "b.txt", content: "bbb" },
    { type: "file", path: "c.txt", content: "ccc" },
  ], "/");

  expect(fs.readFileSync("/a.txt", "utf-8")).toBe("aaa");
  expect(fs.readFileSync("/b.txt", "utf-8")).toBe("bbb");
  expect(fs.readFileSync("/c.txt", "utf-8")).toBe("ccc");
});

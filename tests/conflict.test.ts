import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { file, emit, write, render, root, when } from "../src";

afterEach(() => {
  vol.reset();
});

test("overwrite replaces an existing file", async () => {
  fs.writeFileSync("/existing.txt", "old content");

  await write(
    [{ type: "file", path: "existing.txt", content: "new content", strategy: "overwrite" }],
    "/",
  );

  expect(fs.readFileSync("/existing.txt", "utf-8")).toBe("new content");
});

test("overwrite replaces nested files", async () => {
  fs.mkdirSync("/a/b", { recursive: true });
  fs.writeFileSync("/a/b/file.txt", "old");

  await write([{ type: "file", path: "a/b/file.txt", content: "new", strategy: "overwrite" }], "/");

  expect(fs.readFileSync("/a/b/file.txt", "utf-8")).toBe("new");
});

test("overwrite replaces JSON files", async () => {
  fs.writeFileSync("/data.json", JSON.stringify({ old: true }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "data.json",
        content: { new: true },
        strategy: "overwrite",
      },
    ],
    "/",
  );

  expect(fs.readFileSync("/data.json", "utf-8")).toBe(JSON.stringify({ new: true }, null, 2));
});

test("skip keeps the existing file unchanged", async () => {
  fs.writeFileSync("/keep.txt", "original");

  await write([{ type: "file", path: "keep.txt", content: "overwritten", strategy: "skip" }], "/");

  expect(fs.readFileSync("/keep.txt", "utf-8")).toBe("original");
});

test("skip works for nested files", async () => {
  fs.mkdirSync("/deep", { recursive: true });
  fs.writeFileSync("/deep/nested.txt", "original");

  await write([{ type: "file", path: "deep/nested.txt", content: "new", strategy: "skip" }], "/");

  expect(fs.readFileSync("/deep/nested.txt", "utf-8")).toBe("original");
});

test("skip writes the file when it does not exist", async () => {
  await write([{ type: "file", path: "new.txt", content: "fresh", strategy: "skip" }], "/");

  expect(fs.readFileSync("/new.txt", "utf-8")).toBe("fresh");
});

test("skip does not evaluate expensive content unnecessarily", async () => {
  fs.writeFileSync("/existing.txt", "original");

  const expensive = vi.fn(() => "expensive");

  const outputs = await emit(root(file("existing.txt", expensive, { strategy: "skip" })));

  await write(outputs, "/");

  expect(fs.readFileSync("/existing.txt", "utf-8")).toBe("original");
  expect(expensive).toHaveBeenCalledOnce();
});

// ── error ────────────────────────────────────────────────────────────────────

test("error throws if file exists", async () => {
  fs.writeFileSync("/exists.txt", "content");

  await expect(
    write([{ type: "file", path: "exists.txt", content: "new", strategy: "error" }], "/"),
  ).rejects.toThrow("File already exists");
});

test("error includes the file path in the error message", async () => {
  fs.mkdirSync("/path/to", { recursive: true });
  fs.writeFileSync("/path/to/file.txt", "content");

  await expect(
    write(
      [
        {
          type: "file",
          path: "path/to/file.txt",
          content: "new",
          strategy: "error",
        },
      ],
      "/",
    ),
  ).rejects.toThrow("path/to/file.txt");
});

test("error does not affect unrelated files", async () => {
  fs.writeFileSync("/conflict.txt", "old");
  fs.writeFileSync("/other.txt", "keep");

  await expect(
    write(
      [
        { type: "file", path: "conflict.txt", content: "new", strategy: "error" },
        { type: "file", path: "other.txt", content: "changed", strategy: "overwrite" },
      ],
      "/",
    ),
  ).rejects.toThrow("File already exists");

  expect(fs.readFileSync("/other.txt", "utf-8")).toBe("keep");
});

test("error writes the file when it does not exist", async () => {
  await write([{ type: "file", path: "fresh.txt", content: "hello", strategy: "error" }], "/");

  expect(fs.readFileSync("/fresh.txt", "utf-8")).toBe("hello");
});

// ── merge ────────────────────────────────────────────────────────────────────

test("merge merges shallow objects", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ a: 1 }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { b: 2 },
        strategy: "merge",
      },
    ],
    "/",
  );

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ a: 1, b: 2 });
});

test("merge merges deeply nested objects", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ nested: { a: 1, b: 1 } }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { nested: { b: 2, c: 3 } },
        strategy: "merge",
      },
    ],
    "/",
  );

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ nested: { a: 1, b: 2, c: 3 } });
});

test("merge generated values override existing values", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ key: "old" }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { key: "new" },
        strategy: "merge",
      },
    ],
    "/",
  );

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ key: "new" });
});

test("merge replaces arrays entirely", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ items: [1, 2, 3] }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { items: [4, 5] },
        strategy: "merge",
      },
    ],
    "/",
  );

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ items: [4, 5] });
});

test("merge overwrites primitive values", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ str: "hello", num: 42, bool: true }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { str: "world", num: 99, bool: false },
        strategy: "merge",
      },
    ],
    "/",
  );

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ str: "world", num: 99, bool: false });
});

test("merge writes the file when it does not exist", async () => {
  await write(
    [
      {
        type: "file",
        path: "new.json",
        content: { key: "value" },
        strategy: "merge",
      },
    ],
    "/",
  );

  expect(JSON.parse(fs.readFileSync("/new.json", "utf-8"))).toEqual({ key: "value" });
});

test("merge throws on non-object generated content", async () => {
  fs.writeFileSync("/data.json", JSON.stringify({ a: 1 }, null, 2));

  await expect(
    write([{ type: "file", path: "data.json", content: "string", strategy: "merge" }], "/"),
  ).rejects.toThrow('Cannot merge "data.json": generated content must be a JSON object');
});

test("merge throws on non-JSON existing file", async () => {
  fs.writeFileSync("/data.txt", "not json");

  await expect(
    write(
      [
        {
          type: "file",
          path: "data.txt",
          content: { key: "value" },
          strategy: "merge",
        },
      ],
      "/",
    ),
  ).rejects.toThrow('Cannot merge "data.txt": existing file is not valid JSON');
});

test("merge throws on non-object existing file", async () => {
  fs.writeFileSync("/data.json", JSON.stringify("just a string"));

  await expect(
    write(
      [
        {
          type: "file",
          path: "data.json",
          content: { key: "value" },
          strategy: "merge",
        },
      ],
      "/",
    ),
  ).rejects.toThrow('Cannot merge "data.json": existing content must be a JSON object');
});

test("merge preserves JSON formatting", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ a: 1 }, null, 2));

  await write(
    [
      {
        type: "file",
        path: "config.json",
        content: { b: 2 },
        strategy: "merge",
      },
    ],
    "/",
  );

  const content = fs.readFileSync("/config.json", "utf-8");
  expect(content).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
});

test("merge with function content resolves and merges", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ existing: true }, null, 2));

  const outputs = await emit(
    root(file("config.json", () => ({ generated: true }), { strategy: "merge" })),
  );

  await write(outputs, "/");

  const result = JSON.parse(fs.readFileSync("/config.json", "utf-8"));
  expect(result).toEqual({ existing: true, generated: true });
});

// ── via file() and emit() ────────────────────────────────────────────────────

test("file with strategy passes through emit", async () => {
  const outputs = await emit(root(file("test.txt", "hello", { strategy: "skip" })));

  expect(outputs[0]).toHaveProperty("strategy", "skip");
});

test("file without strategy omits strategy in output", async () => {
  const outputs = await emit(root(file("test.txt", "hello")));

  expect(outputs[0]).not.toHaveProperty("strategy");
});

// ── render with strategies ───────────────────────────────────────────────────

test("render with overwrite strategy", async () => {
  fs.mkdirSync("/out", { recursive: true });
  fs.writeFileSync("/out/file.txt", "old");

  await render([root(file("file.txt", "new", { strategy: "overwrite" }))], "/out");

  expect(fs.readFileSync("/out/file.txt", "utf-8")).toBe("new");
});

test("render with skip strategy", async () => {
  fs.mkdirSync("/out", { recursive: true });
  fs.writeFileSync("/out/file.txt", "original");

  await render([root(file("file.txt", "new", { strategy: "skip" }))], "/out");

  expect(fs.readFileSync("/out/file.txt", "utf-8")).toBe("original");
});

test("render with error strategy throws", async () => {
  fs.mkdirSync("/out", { recursive: true });
  fs.writeFileSync("/out/file.txt", "existing");

  await expect(
    render([root(file("file.txt", "new", { strategy: "error" }))], "/out"),
  ).rejects.toThrow("File already exists");
});

test("render with merge strategy", async () => {
  fs.mkdirSync("/out", { recursive: true });
  fs.writeFileSync("/out/config.json", JSON.stringify({ existing: true }, null, 2));

  await render([root(file("config.json", { generated: true }, { strategy: "merge" }))], "/out");

  const result = JSON.parse(fs.readFileSync("/out/config.json", "utf-8"));
  expect(result).toEqual({ existing: true, generated: true });
});

// ── regression tests ─────────────────────────────────────────────────────────

test("existing code without strategy continues to work", async () => {
  await write([{ type: "file", path: "test.txt", content: "hello" }], "/");

  expect(fs.readFileSync("/test.txt", "utf-8")).toBe("hello");
});

test("when() still behaves correctly with strategies", async () => {
  fs.writeFileSync("/skip.txt", "original");

  const outputs = await emit(
    root(
      file("always.txt", "yes"),
      when(true, file("skip.txt", "no", { strategy: "skip" })),
      when(false, file("never.txt", "no")),
    ),
  );

  await write(outputs, "/");

  expect(fs.readFileSync("/always.txt", "utf-8")).toBe("yes");
  expect(fs.readFileSync("/skip.txt", "utf-8")).toBe("original");
  expect(fs.existsSync("/never.txt")).toBe(false);
});

test("async content still behaves correctly with strategies", async () => {
  fs.writeFileSync("/existing.txt", "old");

  const outputs = await emit(
    root(
      file("existing.txt", async () => "new", { strategy: "skip" }),
      file("generated.txt", async () => "async content"),
    ),
  );

  await write(outputs, "/");

  expect(fs.readFileSync("/existing.txt", "utf-8")).toBe("old");
  expect(fs.readFileSync("/generated.txt", "utf-8")).toBe("async content");
});

import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { file, render, root, write } from "../src";

afterEach(() => {
  vol.reset();
});

test("overwrite, skip, and error strategies", async () => {
  // overwrite (default) replaces existing content
  fs.writeFileSync("/file.txt", "old");
  await write([{ type: "file" as const, path: "file.txt", content: "new" }], "/");
  expect(fs.readFileSync("/file.txt", "utf-8")).toBe("new");

  // skip preserves existing file content
  fs.writeFileSync("/keep.txt", "original");
  await write(
    [
      {
        type: "file" as const,
        path: "keep.txt",
        content: "overwritten",
        strategy: "skip" as const,
      },
    ],
    "/",
  );
  expect(fs.readFileSync("/keep.txt", "utf-8")).toBe("original");

  // skip writes the file when it does not exist
  await write(
    [{ type: "file" as const, path: "new.txt", content: "fresh", strategy: "skip" as const }],
    "/",
  );
  expect(fs.readFileSync("/new.txt", "utf-8")).toBe("fresh");

  // error throws when file exists
  fs.writeFileSync("/exists.txt", "content");
  await expect(
    write(
      [{ type: "file" as const, path: "exists.txt", content: "new", strategy: "error" as const }],
      "/",
    ),
  ).rejects.toThrow("file already exists and strategy is 'error'");

  // error writes when file does not exist
  await write(
    [{ type: "file" as const, path: "fresh.txt", content: "hello", strategy: "error" as const }],
    "/",
  );
  expect(fs.readFileSync("/fresh.txt", "utf-8")).toBe("hello");
});

test("merge strategy", async () => {
  fs.writeFileSync("/config.json", JSON.stringify({ a: 1, nested: { x: 1 } }, null, 2));

  await write(
    [
      {
        type: "file" as const,
        path: "config.json",
        content: { b: 2, nested: { y: 2 } },
        strategy: "merge" as const,
      },
    ],
    "/",
  );

  expect(JSON.parse(fs.readFileSync("/config.json", "utf-8") as string)).toEqual({
    a: 1,
    b: 2,
    nested: { x: 1, y: 2 },
  });

  // error: non-object generated content
  await expect(
    write(
      [
        {
          type: "file" as const,
          path: "config.json",
          content: "string",
          strategy: "merge" as const,
        },
      ],
      "/",
    ),
  ).rejects.toThrow("generated content must be a plain JSON object");

  // error: non-JSON existing file
  fs.writeFileSync("/data.txt", "not json");
  await expect(
    write(
      [
        {
          type: "file" as const,
          path: "data.txt",
          content: { k: "v" },
          strategy: "merge" as const,
        },
      ],
      "/",
    ),
  ).rejects.toThrow("existing file contains invalid JSON");
});

test("conflict strategies work through render end-to-end", async () => {
  // overwrite
  fs.writeFileSync("/file.txt", "old");
  await render("/", root(file("file.txt", "new")));
  expect(fs.readFileSync("/file.txt", "utf-8")).toBe("new");

  // skip
  fs.writeFileSync("/keep.txt", "original");
  await render("/", root(file("keep.txt", "new", { strategy: "skip" })));
  expect(fs.readFileSync("/keep.txt", "utf-8")).toBe("original");

  // error
  fs.writeFileSync("/conflict.txt", "existing");
  await expect(
    render("/", root(file("conflict.txt", "new", { strategy: "error" }))),
  ).rejects.toThrow("file already exists and strategy is 'error'");
});

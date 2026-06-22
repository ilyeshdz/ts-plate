import { afterEach, expect, test, vi } from "vitest";
import { fs, vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const { fs } = await import("memfs");
  return fs.promises;
});

import { emit, file, render, root, write } from "../src";

afterEach(() => {
  vol.reset();
});

test("emit includes Uint8Array content as-is", async () => {
  const bytes = new Uint8Array([0, 1, 2, 255]);
  const outputs = await emit(file("data.bin", bytes));

  expect(outputs).toEqual([{ type: "file", path: "data.bin", content: bytes }]);
});

test("emit resolves async Uint8Array content", async () => {
  const outputs = await emit(file("async.bin", async () => new Uint8Array([3, 4, 5])));

  expect(outputs).toHaveLength(1);
  expect(outputs[0].type).toBe("file");
  expect((outputs[0] as { content?: unknown }).content).toEqual(new Uint8Array([3, 4, 5]));
});

test("write writes Uint8Array content as raw bytes", async () => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  await write([{ type: "file" as const, path: "icon.png", content: bytes }], "/root");

  const written = fs.readFileSync("/root/icon.png");
  expect(written).toEqual(Buffer.from(bytes));
});

test("render emits and writes binary content", async () => {
  const bytes = new Uint8Array([255, 254, 253]);
  await render([root(file("bin.dat", bytes))], "/root");

  const written = fs.readFileSync("/root/bin.dat");
  expect(written).toEqual(Buffer.from(bytes));
});

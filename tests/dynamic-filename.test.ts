import { expect, test } from "vitest";
import { dir, file, emit, root, when } from "../src";

test("static filename still works", async () => {
  expect(await emit(file("README.md", "# Hello"))).toEqual([
    { type: "file", path: "README.md", content: "# Hello" },
  ]);
});

test("nested static files still work", async () => {
  const tree = root(
    dir(
      "src",
      file("index.ts", "export const a = 1"),
      dir("utils", file("helpers.ts", "export const add = (a: number, b: number) => a + b")),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts", content: "export const a = 1" },
    { type: "dir", path: "src/utils" },
    {
      type: "file",
      path: "src/utils/helpers.ts",
      content: "export const add = (a: number, b: number) => a + b",
    },
  ]);
});

test("sync dynamic filename resolves from function", async () => {
  expect(await emit(file(() => "README.md", "# Hello"))).toEqual([
    { type: "file", path: "README.md", content: "# Hello" },
  ]);
});

test("sync dynamic filename works in nested directories", async () => {
  const tree = root(
    dir(
      "packages",
      file(() => "index.ts", "export {}"),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "packages" },
    { type: "file", path: "packages/index.ts", content: "export {}" },
  ]);
});

test("sync dynamic filename can depend on external variables", async () => {
  const ext = "ts";
  const name = "index";

  expect(await emit(file(() => `${name}.${ext}`, ""))).toEqual([
    { type: "file", path: "index.ts", content: "" },
  ]);
});

test("async dynamic filename resolves async", async () => {
  expect(await emit(file(async () => "README.md", "# Hello"))).toEqual([
    { type: "file", path: "README.md", content: "# Hello" },
  ]);
});

test("async dynamic filename works with async content", async () => {
  expect(
    await emit(
      file(
        async () => "data.json",
        async () => ({ name: "test" }),
      ),
    ),
  ).toEqual([{ type: "file", path: "data.json", content: { name: "test" } }]);
});

test("async dynamic filename works in nested directories", async () => {
  const tree = root(
    dir(
      "packages",
      file(async () => "package.json", { name: "test" }),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "packages" },
    { type: "file", path: "packages/package.json", content: { name: "test" } },
  ]);
});

test("mixed: file(string, string)", async () => {
  expect(await emit(file("a.txt", "hello"))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("mixed: file(string, () => ...)", async () => {
  expect(await emit(file("a.txt", () => "hello"))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("mixed: file(string, async () => ...)", async () => {
  expect(await emit(file("a.txt", async () => "hello"))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("mixed: file(() => ..., string)", async () => {
  expect(await emit(file(() => "a.txt", "hello"))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("mixed: file(() => ..., () => ...)", async () => {
  expect(
    await emit(
      file(
        () => "a.txt",
        () => "hello",
      ),
    ),
  ).toEqual([{ type: "file", path: "a.txt", content: "hello" }]);
});

test("mixed: file(() => ..., async () => ...)", async () => {
  expect(
    await emit(
      file(
        () => "a.txt",
        async () => "hello",
      ),
    ),
  ).toEqual([{ type: "file", path: "a.txt", content: "hello" }]);
});

test("mixed: file(async () => ..., string)", async () => {
  expect(await emit(file(async () => "a.txt", "hello"))).toEqual([
    { type: "file", path: "a.txt", content: "hello" },
  ]);
});

test("mixed: file(async () => ..., () => ...)", async () => {
  expect(
    await emit(
      file(
        async () => "a.txt",
        () => "hello",
      ),
    ),
  ).toEqual([{ type: "file", path: "a.txt", content: "hello" }]);
});

test("mixed: file(async () => ..., async () => ...)", async () => {
  expect(
    await emit(
      file(
        async () => "a.txt",
        async () => "hello",
      ),
    ),
  ).toEqual([{ type: "file", path: "a.txt", content: "hello" }]);
});

test("dynamic filename with sync content and external variable", async () => {
  const packageName = "my-lib";

  const tree = root(
    dir(
      "packages",
      file(() => `${packageName}.json`, { name: packageName }),
      file(() => `${packageName}.md`, `# ${packageName}`),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "packages" },
    { type: "file", path: "packages/my-lib.json", content: { name: "my-lib" } },
    { type: "file", path: "packages/my-lib.md", content: "# my-lib" },
  ]);
});

test("validation: throws on empty filename", async () => {
  await expect(emit(file(() => "", "content"))).rejects.toThrow("Filename must not be empty");
});

test("validation: throws on whitespace filename", async () => {
  await expect(emit(file(() => "   ", "content"))).rejects.toThrow("Filename must not be empty");
});

test("validation: throws on path traversal with ../", async () => {
  await expect(emit(file(() => "../secret.txt", "content"))).rejects.toThrow(
    "Filename must not traverse",
  );
});

test("validation: throws on path traversal with nested ../", async () => {
  await expect(emit(file(() => "foo/../../secret.txt", "content"))).rejects.toThrow(
    "Filename must not traverse",
  );
});

test("validation: throws on absolute path", async () => {
  await expect(emit(file(() => "/etc/passwd", "content"))).rejects.toThrow(
    "Absolute paths are not allowed",
  );
});

test("validation: static empty filename throws", async () => {
  await expect(emit(file("", "content"))).rejects.toThrow("Filename must not be empty");
});

test("validation: static whitespace filename throws", async () => {
  await expect(emit(file("   ", "content"))).rejects.toThrow("Filename must not be empty");
});

test("validation: static path traversal throws", async () => {
  await expect(emit(file("../secret.txt", "content"))).rejects.toThrow(
    "Filename must not traverse",
  );
});

test("validation: static absolute path throws", async () => {
  await expect(emit(file("/etc/passwd", "content"))).rejects.toThrow(
    "Absolute paths are not allowed",
  );
});

test("regression: when() still works with dynamic filenames", async () => {
  const tree = root(
    when(
      true,
      file(() => "active.txt", "yes"),
    ),
    when(
      false,
      file(() => "inactive.txt", "no"),
    ),
  );

  expect(await emit(tree)).toEqual([{ type: "file", path: "active.txt", content: "yes" }]);
});

test("regression: directory rendering still works", async () => {
  const tree = root(
    dir(
      "components",
      file(() => "Button.tsx", "export const Button = () => null"),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "components" },
    { type: "file", path: "components/Button.tsx", content: "export const Button = () => null" },
  ]);
});

test("regression: conflict strategies still work with dynamic filenames", async () => {
  const node = file(() => "test.txt", "content", { strategy: "overwrite" });
  expect(node.options).toEqual({ strategy: "overwrite" });
  expect(await emit(node)).toEqual([
    { type: "file", path: "test.txt", content: "content", strategy: "overwrite" },
  ]);
});

test("regression: object content serialization still works", async () => {
  const pkg = { name: "ts-plate", version: "1.0.0" };

  expect(await emit(file(() => "package.json", pkg))).toEqual([
    { type: "file", path: "package.json", content: pkg },
  ]);
});

test("file node stores function name (not evaluated at creation)", () => {
  const fn = () => "dynamic.txt";
  const node = file(fn, "content");

  expect(node.name).toBe(fn);
  expect(typeof node.name).toBe("function");
});

test("file node stores async function name (not evaluated at creation)", () => {
  const fn = async () => "async-dynamic.txt";
  const node = file(fn, "content");

  expect(node.name).toBe(fn);
});

test("dynamic filename with content that references computed variables", async () => {
  const framework = "react";

  expect(await emit(file(() => `${framework}.config.ts`, {}))).toEqual([
    { type: "file", path: "react.config.ts", content: {} },
  ]);
});

test("evaluation order: validate filename before resolving content", async () => {
  let contentEvaluated = false;

  await expect(
    emit(
      file(
        () => "",
        async () => {
          contentEvaluated = true;
          return "expensive content";
        },
      ),
    ),
  ).rejects.toThrow("Filename must not be empty");

  expect(contentEvaluated).toBe(false);
});

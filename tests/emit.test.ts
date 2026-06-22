import { expect, test } from "vitest";
import { dir, file, emit, root, when } from "../src";

test("emit evaluates a realistic tree", async () => {
  const tree = root(
    dir(
      "project",

      file("README.md", "# My Project"),

      file("package.json", { name: "my-project" }),

      dir(
        "src",
        file("index.ts"),
        file("utils.ts", () => "// generated"),
      ),

      dir("tests", [file("unit.test.ts", async () => "test('x', () => {})")]),

      when(true, file("debug.log", "dev-only")),
      when(false, file("hidden.log", "invisible")),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "dir", path: "project" },
    { type: "file", path: "project/README.md", content: "# My Project" },
    { type: "file", path: "project/package.json", content: { name: "my-project" } },
    { type: "dir", path: "project/src" },
    { type: "file", path: "project/src/index.ts" },
    { type: "file", path: "project/src/utils.ts", content: "// generated" },
    { type: "dir", path: "project/tests" },
    {
      type: "file",
      path: "project/tests/unit.test.ts",
      content: "test('x', () => {})",
    },
    { type: "file", path: "project/debug.log", content: "dev-only" },
  ]);
});

test("empty and multiple roots produce correct outputs", async () => {
  expect(await emit(root())).toEqual([]);
  expect(await emit(root(file("a.txt")), root(file("b.txt")))).toEqual([
    { type: "file", path: "a.txt" },
    { type: "file", path: "b.txt" },
  ]);
});

test("async when condition resolves to true", async () => {
  const tree = root(
    when(async () => true, file("yes.txt", "included")),
    when(async () => false, file("no.txt", "excluded")),
  );

  expect(await emit(tree)).toEqual([{ type: "file", path: "yes.txt", content: "included" }]);
});

test("async when with dynamic async content inside", async () => {
  const tree = root(
    when(
      async () => {
        const res = await Promise.resolve(true);
        return res;
      },
      file("data.txt", async () => {
        const content = await Promise.resolve("async content");
        return content;
      }),
    ),
  );

  expect(await emit(tree)).toEqual([{ type: "file", path: "data.txt", content: "async content" }]);
});

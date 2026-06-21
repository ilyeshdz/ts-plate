import { expect, test } from "vitest";
import { dir, file, emit, root } from "../src";

test("dynamic filenames resolve from sync and async functions", async () => {
  const name = "data";

  const tree = root(
    file(() => `${name}.json`, { key: "value" }),
    file(async () => "readme.md", "# Readme"),
    dir(
      "src",
      file(() => "index.ts"),
    ),
  );

  expect(await emit(tree)).toEqual([
    { type: "file", path: "data.json", content: { key: "value" } },
    { type: "file", path: "readme.md", content: "# Readme" },
    { type: "dir", path: "src" },
    { type: "file", path: "src/index.ts" },
  ]);
});

test("validates filenames and evaluates name before content", async () => {
  let contentEvaluated = false;

  await expect(
    emit(
      file(
        () => "",
        async () => {
          contentEvaluated = true;
          return "expensive";
        },
      ),
    ),
  ).rejects.toThrow("Filename must not be empty");

  expect(contentEvaluated).toBe(false);

  await expect(emit(file(() => "../secret.txt", "content"))).rejects.toThrow("must not traverse");

  await expect(emit(file(() => "/etc/passwd", "content"))).rejects.toThrow(
    "Absolute paths are not allowed",
  );
});

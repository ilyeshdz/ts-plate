# Essentials

## file()

Create a file with static content, a JSON object, or a lazy function.

```ts
file("readme.md", "# Project Title"); // static text
file("package.json", { name: "my-app" }); // JSON (auto-serialized)
file("data.json", async () => {
  // lazy (runs at emit)
  const res = await fetch("https://api.example.com/config");
  return res.json();
});
```

The filename can also be a function. It resolves at emit time, before content evaluates.

```ts
file(() => `${pkgName}.config.ts`, { port: 3000 });
```

::: warning
Dynamic filenames are validated before any content function runs. If the filename is empty, traverses up (`../`), or is absolute (`/etc/`), it throws before your content executes.
:::

## dir()

Group children under a directory.

```ts
dir(
  "components",
  file("button.tsx", `export const Button = () => <button />`),
  file("input.tsx", `export const Input = () => <input />`),
);
```

Children can be individual arguments or an array. Output is depth-first and deterministic.

## root()

Like `dir()` but does not create a directory entry. Use it to return multiple top-level nodes.

```ts
root(file("README.md", "# Project"), file("LICENSE", "MIT"), dir("src", file("index.ts")));
```

## when()

Conditionally include children.

```ts
when(true, file("always.txt"));
when(false, file("never.txt")); // [!code --]
```

The condition can be a boolean or a function (sync or async). `when()` never appears in the output itself.

## copy()

Bring an existing file or directory into the output tree.

```ts
copy("templates/license-mit.txt", "LICENSE"); // single file
copy("assets", {
  rename: (n) => `static/${n}`, // directory
  filter: (n) => n.endsWith(".svg"),
});
```

## emit()

Walk the tree and return a flat output array. This is where lazy content and dynamic filenames resolve.

```ts
const outputs = await emit(tree);
// [{ type: "file"|"dir"|"copy", path, content?, strategy? }]
```

## write()

Write the output array to disk. Creates parent directories as needed.

```ts
await write(outputs);
await write(outputs, "./output-dir");
```

Conflict strategies control what happens when files already exist:

::: code-group

```ts [overwrite]
// Default. Replaces the file.
file("config.json", { port: 3000 }, { strategy: "overwrite" });
```

```ts [skip]
// Leaves the file untouched.
file("config.json", { port: 3000 }, { strategy: "skip" });
```

```ts [error]
// Throws ConflictError if file exists.
file("config.json", { port: 3000 }, { strategy: "error" });
```

```ts [merge]
// Deep-merges into existing JSON. Arrays are replaced.
file("config.json", { port: 3000 }, { strategy: "merge" });
```

:::

## render()

Shorthand for emit + write.

```ts
await render(tree);
await render(tree, "./output-dir");
```

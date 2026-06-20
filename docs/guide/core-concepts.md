# Core Concepts

ts-plate is built around a simple insight: a file tree is just a tree, and a
tree can be flattened. That's it. Everything else follows from this.

## The two representations

Trees and flat lists are the same data, viewed differently. ts-plate gives you
both, and you switch between them with `emit()`.

### Tree representation

This is what you build with `file()`, `dir()`, `root()`, and friends. Trees are
good for composition: you can nest things, conditionally include subtrees, and
pass trees around as values.

```ts
const tree = root(
  dir("src",
    file("index.ts"),
    dir("utils", file("helpers.ts")),
  ),
);
```

Every tree node is a plain object with a `type` discriminant. No classes, no
prototypes, no surprises.

```
{ type: "root", children: [ ... ] }
{ type: "dir",  name: "src", children: [ ... ] }
{ type: "file", name: "index.ts", content: "..." }
```

### Flat representation

This is what `emit()` returns — an ordered array of `Output` entries. Flat
lists are good for inspection, serialization, filtering, and writing.

```ts
const outputs = await emit(tree);

for (const output of outputs) {
  console.log(output.path); // e.g. "src/index.ts"
}
```

Each output also has a `type`:

```
{ type: "dir",  path: "src" }
{ type: "file", path: "src/index.ts", content: "..." }
{ type: "dir",  path: "src/utils" }
{ type: "file", path: "src/utils/helpers.ts" }
```

You can manipulate this array before writing. Filter files, rename paths, add
entries — it's just an array.

## Node types

### `file(name, content?)`

A file node. `content` is optional and can be:
- A `string`
- A plain object (serialized as JSON at write time)
- A sync function `() => string | object`
- An async function `() => Promise<string | object>`

```ts
file("readme.md", "# Hello")
file("package.json", { name: "my-pkg", version: "1.0.0" })
file("timestamp.txt", () => new Date().toISOString())
file("data.json", async () => { const res = await fetch(url); return res.json() })
```

### `dir(name, ...children)`

A directory node. Children can be any node type. Directories with no children
are allowed — they produce an empty folder on disk.

```ts
dir("empty-folder")
dir("src", file("index.ts"), dir("lib"))
```

### `root(...children)`

A container node. Use it to group multiple top-level entries. You can also pass
multiple roots to `emit()`:

```ts
const a = root(file("a.txt"));
const b = root(file("b.txt"));
await emit(a, b); // two files at root level
```

### `when(condition, ...children)`

A conditional node that includes children only when `condition` is truthy.
Accepts a `boolean` or a `() => boolean` function for lazy evaluation.

```ts
when(true,  file("always.txt"))           // always included
when(false, file("never.txt"))            // always skipped
when(() => opts.debug, file("debug.log"))  // evaluated at emit time
```

### `copy(from, name)`

A node that represents a file to be copied from an external path. The actual
copy happens during `write()`.

```ts
copy("/Users/me/templates/license.txt", "LICENSE")
```

## The pipeline

```
Build  ──emit()──>  Flat outputs  ──write()──>  Disk
                        │
                        ▼
                   Inspect / filter / transform
```

Each stage is optional. You could build a tree and only emit without writing
(useful for dry runs). You could build outputs manually and only write (if you
don't need the tree abstraction). Or you could inspect the flat list between
emit and write to verify everything looks right.

`render()` is a shortcut that chains emit and write together:

```
Build  ──render()──>  Disk + Flat outputs
```

## Deterministic ordering

Outputs are always ordered the same way:
1. Depth-first walk of the tree
2. Directory entries appear before their children
3. Children maintain insertion order

This means two things:
- You can rely on parent directories existing before their children when writing
- The output array is reproducible — same tree, same order, every time

## Why both representations?

Trees compose. Flat lists process.

With trees, you can build a subtree once and reuse it in multiple places:

```ts
const shared = root(
  file("LICENSE"),
  file(".gitignore", "node_modules\ndist\n"),
);

const projectA = root(dir("app-a", shared.children));
const projectB = root(dir("app-b", shared.children));
```

With flat lists, you can inspect what *would* be written before actually
writing anything:

```ts
const outputs = await emit(tree);
const fileOutputs = outputs.filter(o => o.type === "file");
console.log(`Will write ${fileOutputs.length} files`);
```

Both views matter. Neither replaces the other.

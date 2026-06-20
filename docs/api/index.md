# API Reference

## Builder functions

### `file(name, content?)`

Creates a file node.

```ts
file(name: string, content?: FileContent | FileContentFn): FileNode
```

- `name` — file name, can include an extension
- `content` — optional. Can be a `string`, a JSON-serializable `Record<string, any>`, a sync function `() => FileContent`, or an async function `() => Promise<FileContent>`. If omitted, the file is created empty.

```ts
file("readme.md", "# Hello")
file("package.json", { name: "example" })    // serialized as JSON on write
file("time.txt", () => new Date().toISOString()) // lazy
file("data.json", async () => fetch(url).then(r => r.json())) // async lazy
```

---

### `dir(name, ...children)`

Creates a directory node with optional children.

```ts
dir(name: string, ...children: Node[]): DirectoryNode
```

Directories appear before their children in the emitted output. Empty directories
produce no children but still appear as a `{ type: "dir", path }` entry.

```ts
dir("src")
dir("src", file("index.ts"))
dir("components", dir("ui", file("Button.tsx")))
```

---

### `root(...children)`

Creates a root container. Root nodes flatten their children at the top level,
useful for grouping multiple top-level entries or composing trees.

```ts
root(...children: Node[]): RootNode
```

```ts
root(file("a.txt"), file("b.txt"))
root(dir("src"), dir("tests"))
```

Multiple roots can be passed to `emit()`:

```ts
emit(root(file("a.txt")), root(file("b.txt")))
```

---

### `when(condition, ...children)`

Conditionally includes children. The condition is evaluated at emit time.

```ts
when(condition: Condition, ...children: Node[]): ConditionalNode
```

`Condition` is `boolean | (() => boolean)`. When the condition is falsy, the
children are excluded from the output entirely — they're not even evaluated.

```ts
when(true, file("always.txt"))
when(false, file("never.txt"))                          // skipped
when(() => process.env.DEBUG, file("debug.log"))         // lazy
```

---

### `copy(from, name)`

Creates a node that copies a file from an external path at write time.

```ts
copy(from: string, name: string): CopyNode
```

`from` is the source path. `name` is the destination name within the tree.
The actual file copy happens during `write()`.

```ts
copy("/absolute/path/to/license.txt", "LICENSE")
copy("../shared/template.ts", "src/template.ts")
```

---

## Processing functions

### `emit(...nodes)`

Flattens one or more tree nodes into a deterministic array of `Output` entries.

```ts
emit(...nodes: Node[]): Promise<Output[]>
```

- Walks the tree depth-first
- Directories appear before their children
- Lazy content functions are called during this step
- Returns a flat array

```ts
const outputs = await emit(
  root(dir("src", file("index.ts", ""))),
);
// [{ type: "dir", path: "src" }, { type: "file", path: "src/index.ts", content: "" }]
```

---

### `write(outputs, basePath?)`

Writes an array of `Output` entries to disk.

```ts
write(outputs: Output[], basePath?: string): Promise<void>
```

- Creates parent directories recursively
- Serializes object content as pretty-printed JSON
- Copies files for `type: "copy"` entries
- Default `basePath` is `process.cwd()`

```ts
await write(outputs)              // writes to cwd
await write(outputs, "./dist")    // writes to ./dist
await write(outputs, "/tmp/app")  // writes to absolute path
```

---

### `render(nodes, basePath?)`

Convenience function that calls `emit()` and `write()` in sequence.

```ts
render(nodes: Node[], basePath?: string): Promise<Output[]>
```

Returns the same outputs that `emit()` produces, so you can inspect what was
written.

```ts
const outputs = await render(
  root(dir("out", file("index.html", "<h1>Hi</h1>"))),
  "./build",
);
// Files on disk, outputs returned
```

---

## Types

```ts
type Node = RootNode | FileNode | DirectoryNode | CopyNode | ConditionalNode

type Condition = boolean | (() => boolean)

type FileContent = string | Record<string, any>
type FileContentFn = () => FileContent | Promise<FileContent>

interface FileNode {
  type: "file"
  name: string
  content?: FileContent | FileContentFn
}

interface DirectoryNode {
  type: "dir"
  name: string
  children: Node[]
}

interface RootNode {
  type: "root"
  children: Node[]
}

interface CopyNode {
  type: "copy"
  from: string
  name: string
}

interface ConditionalNode {
  type: "conditional"
  condition: Condition
  children: Node[]
}

type Output = OutputFile | OutputDirectory | OutputCopy

interface OutputFile {
  type: "file"
  path: string
  content?: FileContent
}

interface OutputDirectory {
  type: "dir"
  path: string
}

interface OutputCopy {
  type: "copy"
  path: string
  from: string
}
```

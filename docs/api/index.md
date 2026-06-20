# API Reference

This page describes the public surface of ts-plate. The API is intentionally small, but each function has a distinct job and the distinction is part of the design.

## Builder functions

### `file(name, content?)`

Creates a file node.

```ts
file(name: string, content?: FileContent | FileContentFn): FileNode
```

- `name` - file name, optionally with an extension
- `content` - optional file content

`content` can be:

- a `string`
- a JSON-serializable plain object
- a sync function that returns content
- an async function that resolves content

```ts
file("readme.md", "# Hello");
file("package.json", { name: "example" });
file("time.txt", () => new Date().toISOString());
file("data.json", async () => {
  const res = await fetch("https://api.example.com/data");
  return res.json();
});
```

### `dir(name, ...children)`

Creates a directory node.

```ts
dir(name: string, ...children: Node[]): DirectoryNode
```

Directories are emitted before their children, which keeps the write order stable and intuitive.

```ts
dir("src");
dir("src", file("index.ts"));
dir("components", dir("ui", file("Button.tsx")));
```

### `root(...children)`

Creates a root container for top-level entries.

```ts
root(...children: Node[]): RootNode
```

Use `root()` when you want to group entries without adding a path segment of its own.

```ts
root(file("a.txt"), file("b.txt"));
root(dir("src"), dir("tests"));
```

### `when(condition, ...children)`

Conditionally includes children.

```ts
when(condition: Condition, ...children: Node[]): ConditionalNode
```

`Condition` is `boolean | (() => boolean)`.

```ts
when(true, file("always.txt"));
when(false, file("never.txt"));
when(() => process.env.DEBUG, file("debug.log"));
```

### `copy(from, name)`

Creates a node that copies a file from an external path at write time.

```ts
copy(from: string, name: string): CopyNode
```

`from` is the source path. `name` is the destination name inside the tree.

```ts
copy("/absolute/path/to/license.txt", "LICENSE");
copy("../shared/template.ts", "src/template.ts");
```

## Processing functions

### `emit(...nodes)`

Flattens one or more tree nodes into a deterministic array of outputs.

```ts
emit(...nodes: Node[]): Promise<Output[]>
```

`emit()`:

- walks the tree depth-first
- emits directories before their children
- evaluates lazy file content during emission
- returns a flat array that you can inspect or transform

```ts
const outputs = await emit(root(dir("src", file("index.ts", ""))));
// [{ type: "dir", path: "src" }, { type: "file", path: "src/index.ts", content: "" }]
```

### `write(outputs, basePath?)`

Writes an array of outputs to disk.

```ts
write(outputs: Output[], basePath?: string): Promise<void>
```

`write()`:

- creates parent directories recursively
- serializes object content as pretty-printed JSON
- copies external files for `copy` outputs
- writes relative to `process.cwd()` unless you provide `basePath`

```ts
await write(outputs);
await write(outputs, "./dist");
await write(outputs, "/tmp/app");
```

### `render(nodes, basePath?)`

Convenience function that calls `emit()` and `write()` in sequence.

```ts
render(nodes: Node[], basePath?: string): Promise<Output[]>
```

```ts
const outputs = await render([root(dir("out", file("index.html", "<h1>Hi</h1>")))], "./build");
```

## Types

```ts
type Node = RootNode | FileNode | DirectoryNode | CopyNode | ConditionalNode;

type Condition = boolean | (() => boolean);

type FileContent = string | Record<string, any>;
type FileContentFn = () => FileContent | Promise<FileContent>;

interface FileNode {
  type: "file";
  name: string;
  content?: FileContent | FileContentFn;
}

interface DirectoryNode {
  type: "dir";
  name: string;
  children: Node[];
}

interface RootNode {
  type: "root";
  children: Node[];
}

interface CopyNode {
  type: "copy";
  from: string;
  name: string;
}

interface ConditionalNode {
  type: "conditional";
  condition: Condition;
  children: Node[];
}

type Output = OutputFile | OutputDirectory | OutputCopy;

interface OutputFile {
  type: "file";
  path: string;
  content?: FileContent;
}

interface OutputDirectory {
  type: "dir";
  path: string;
}

interface OutputCopy {
  type: "copy";
  path: string;
  from: string;
}
```

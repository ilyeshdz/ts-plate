# Core Concepts

ts-plate is built around a simple idea: file generation works best when the shape of the project stays visible.

Instead of hiding the structure inside a template language or a CLI convention, ts-plate keeps it as plain TypeScript data until the moment you decide to emit it.

## Two views of the same thing

You can think about a project in two equally valid ways:

- as a tree while you are composing it
- as a flat list while you are inspecting or writing it

`ts-plate` gives you both.

### Tree view

This is the model you build with `file()`, `dir()`, `root()`, `when()`, and `copy()`.

```ts
const tree = root(dir("src", file("index.ts"), dir("utils", file("helpers.ts"))));
```

Tree nodes are plain objects with a `type` field. That keeps them easy to pass around, easy to test, and easy to reason about.

### Flat view

This is what `emit()` returns:

```ts
const outputs = await emit(tree);
```

The flat representation is useful because it is honest. It tells you exactly what would be written, in the order it will be written, without making you touch the filesystem first.

That means you can:

- snapshot the result in tests
- filter or rename paths
- count files before writing
- render a dry run for the user

## The nodes

### `file(name, content?)`

A file node describes a file name and optional content.

`content` can be:

- a string
- a plain object, which becomes JSON when written
- a sync function
- an async function

```ts
file("readme.md", "# Hello");
file("package.json", { name: "my-pkg", version: "1.0.0" });
file("timestamp.txt", () => new Date().toISOString());
file("data.json", async () => {
  const res = await fetch("https://api.example.com/data");
  return res.json();
});
```

The lazy function forms are especially useful when the output depends on the current environment, a network request, or a value you only want to compute once the tree is actually emitted.

### `dir(name, ...children)`

A directory node groups children under a folder.

```ts
dir("src", file("index.ts"), dir("lib"));
```

Empty directories are allowed. If you ask for one, you get one.

### `root(...children)`

A root node is just a container. It is the clean way to group top-level entries or reuse a subtree in more than one place.

```ts
const a = root(file("a.txt"));
const b = root(file("b.txt"));
await emit(a, b);
```

### `when(condition, ...children)`

Conditional nodes are how you keep the tree expressive without making it noisy.

```ts
when(true, file("always.txt"));
when(false, file("never.txt"));
when(() => opts.debug, file("debug.log"));
```

The condition can be a boolean or a function. That keeps the decision lazy when you need it.

### `copy(from, name)`

`copy()` represents a file that already exists somewhere else. ts-plate does not inline the file immediately; it preserves the copy as a first-class output and performs the actual copy during `write()`.

```ts
copy("/Users/me/templates/license.txt", "LICENSE");
```

## The pipeline

The library is easiest to understand as a three-stage pipeline:

```text
Build  ->  Emit  ->  Write
```

Or, if you prefer the fuller version:

```text
Build  ->  Flat outputs  ->  Disk
              |
              v
         Inspect / filter / transform
```

Each stage is optional:

- build trees when you want composability
- emit outputs when you want visibility
- write outputs when you are ready to persist them

`render()` is just the convenience path that does emit and write in sequence.

## Deterministic ordering

Ordering is deliberately stable:

1. depth-first traversal
2. directories before their children
3. children preserved in insertion order

That sounds technical, but it is really about trust. If the same tree produces the same outputs every time, you can write tests with confidence and build tooling on top of it without guessing.

## Why this shape works

Tree structures are good for composition. Flat structures are good for processing.

ts-plate does not force you to choose one forever. It lets you move from one view to the other at the right time.

That is the entire design philosophy: keep generation code readable, keep the output inspectable, and keep the API small enough that the important part remains your own logic.

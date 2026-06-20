---
layout: home

hero:
  name: ts-plate
  text: Build file trees with TypeScript, not templates.
  tagline: A tiny, zero-dependency library for generator logic that stays readable, testable, and fully in your control.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/ilyeshdz/ts-plate

features:
  - icon: 🧩
    title: Functions first
    details: Compose trees with `file()`, `dir()`, `root()`, `when()`, and `copy()` instead of learning another template language.
  - icon: 🪶
    title: Small on purpose
    details: Zero runtime dependencies, a very small API surface, and no hidden CLI layer trying to steer your workflow.
  - icon: 🌿
    title: Built for composition
    details: Trees are plain data, so you can reuse, nest, and generate them from other functions without ceremony.
  - icon: ⏱️
    title: Lazy when needed
    details: Content can be sync or async and is only evaluated at emit time, which keeps generators honest and predictable.
---

ts-plate is the kind of library you reach for when the generator itself matters.

It is not trying to be the whole product. It is trying to be the clean, dependable layer underneath the product you actually want to ship. If you are building a CLI, a project starter, or a code generation workflow, ts-plate gives you the file-tree machinery without the baggage.

```ts
import { root, dir, file, when, emit } from "@ilyeshdz/ts-plate";

const tree = root(
  dir(
    "src",
    file("index.ts", `export const add = (a: number, b: number) => a + b`),
    when(true, dir("utils", file("helpers.ts"))),
  ),
);

const outputs = await emit(tree);
```

There is no template engine to debug and no CLI convention to work around. You write TypeScript, build a tree, inspect the outputs, and decide when the filesystem should change.

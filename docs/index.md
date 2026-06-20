---
layout: home

hero:
  name: ts-plate
  text: A lightweight library for building file trees declaratively.
  tagline: Zero-dependency TypeScript library. Compose, emit, write.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/ilyeshdz/ts-plate

features:
  - icon: 🧩
    title: Functions over templates
    details: Compose trees with `file()`, `dir()`, `root()` — no EJS, no Handlebars, no CLI.
  - icon: 🪶
    title: Zero deps
    details: 200 lines of TypeScript, zero runtime dependencies.
  - icon: ⏳
    title: Lazy content
    details: Content can be a sync or async function — evaluated only when you call `emit()`.
  - icon: 🌳
    title: Tree in, flat out
    details: Compose as a tree, flatten with `emit()`, inspect before writing.
---

```ts
import { root, dir, file, emit } from "@ilyeshdz/ts-plate"

const tree = root(
  dir("src",
    file("index.ts", `export const add = (a: number, b: number) => a + b`),
    dir("utils", file("helpers.ts")),
  ),
)

const outputs = await emit(tree)
// [
//   { type: "dir",  path: "src" },
//   { type: "file", path: "src/index.ts",     content: "export const add = ..." },
//   { type: "dir",  path: "src/utils" },
//   { type: "file", path: "src/utils/helpers.ts" },
// ]
```

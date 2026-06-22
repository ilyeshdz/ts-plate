---
layout: home

hero:
  name: ts-plate
  text: TypeScript file trees,<br/>from data to disk.
  tagline: Compose, emit, inspect, write. A zero-dependency library for generator logic that stays readable, testable, and in your control.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/ilyeshdz/ts-plate

features:
  - icon: 🧩
    title: Pure data, not templates
    details: Trees are plain objects. No template engine, no DSL. Inspect everything at every step.
  - icon: 🔄
    title: Pipeline is explicit
    details: Build, Emit, Inspect, Write. Each step is separate and testable. Dry-run is the default.
  - icon: 🪶
    title: Small API
    details: Zero dependencies. Six node factories, three runtime functions. Learn it in minutes.
  - icon: 🌿
    title: Everything composes
    details: Trees nest. Functions wrap trees. Conditions gate subtrees. Copy brings in files.
  - icon: ⏱️
    title: Lazy by default
    details: Content functions run at emit, not build. Dynamic filenames validate before their content evaluates.
  - icon: 🧪
    title: Testable
    details: Emit returns an array. Snapshot it, transform it, assert on it. No mock filesystem needed.
  - icon: 🚀
    title: Start a project
    details: Use `pnpm create ts-plate` (or npm / bun / yarn) to scaffold a new project with ts-plate pre-configured.
---

```ts
import { root, dir, file, emit, write } from "@ilyeshdz/ts-plate";

// Build the tree
const tree = root(dir("app", file("index.ts", `console.log("ok")`)));

// Emit and inspect
const outputs = await emit(tree);
console.log(outputs);

// Write to disk
await write(outputs, "./output");
```

# Introduction

ts-plate is a TypeScript library for describing file trees as data and writing them to disk when you're ready.

```ts
import { file, emit } from "@ilyeshdz/ts-plate";

const outputs = await emit(file("hello.txt", "Hello, world!"));
```

The output is just an array. You can inspect it, tweak it, or pass it to `write()`.

## Why

Most file generation tools make you learn a template language, follow a directory convention, or work inside a CLI. That works fine until your project stops being simple.

ts-plate does one thing: it lets you describe a file tree with ordinary TypeScript functions. The tree is just data. You build it, inspect it, then write it.

Composition works like you'd expect. Wrap a tree in a function, call it from somewhere else, nest it inside a directory. It's all just functions returning plain objects.

Content can be a string, an object, or a function. Function content runs when you emit, not when you build. That means you can defer API calls, timestamps, and user input to the right moment.

And because emit returns plain data, you can show the user a preview before writing anything.

## What it is not

ts-plate is not a CLI. It doesn't prompt users, validate input, or scaffold projects. It's the generation layer you build your own tool on top of.

## When

Use ts-plate when you want a type-driven way to build generators and you want to keep the structure visible. It fits well inside custom CLIs, code generators, and internal scaffolding tools.

Skip it if you want a turnkey scaffolder with opinionated defaults. Other tools do that already.

# Why ts-plate?

There are a lot of file scaffolding tools out there. I tried most of them, and
they all left me with the same feeling: *why does this have to be so
complicated?*

## The template problem

Every scaffolder makes you learn a template language. EJS, Handlebars, Jinja,
Liquid — they all look like programming but aren't quite. You end up with things
like:

```ejs
<% if (useTypescript) { %>import { Foo } from "./foo";<% } %>
```

It's string interpolation pretending to be logic. Your IDE doesn't understand
it. Formatting breaks. One missing `<%` and your whole scaffold is garbage.

And the worst part? You already know how to write TypeScript. Why not use it?

## The composition problem

Most tools make you define your file tree in a config file or a template
directory. You can't compose trees from other trees. You can't reuse parts.
You can't pass a subtree to a function, get a different subtree back, and plug
it somewhere else.

But with ts-plate, composition is the entire point:

```ts
function generateReactComponent(name: string) {
  return dir(name,
    file(`${name}.tsx`, componentTemplate(name)),
    file(`${name}.test.tsx`, testTemplate(name)),
    file(`${name}.css`, ""),
  );
}

const app = root(
  dir("src",
    generateReactComponent("Button"),
    generateReactComponent("Card"),
    generateReactComponent("Modal"),
  ),
);
```

This isn't a special feature. It's just functions calling functions.

## The evaluation problem

When do templates get evaluated? During generation, sure — but what if you want
to generate content that depends on the current time, an API response, or a
random value?

In ts-plate, file content can be a function that runs *at emit time*, not at
tree-build time. This means you can create lazy content that only evaluates
when someone actually calls `emit()`:

```ts
const node = file("timestamp.txt", () => new Date().toISOString());
// This runs only when emit() is called, not when file() is
```

It also means conditional content stays out of memory until it's needed. If you
build a massive tree but only emit a subset, the unused content functions never
run.

## How it compares

|                            | ts-plate | Yeoman / Plop | scaffdog | Degit |
|----------------------------|----------|---------------|----------|-------|
| Template language          | None     | EJS / Handlebars | Markdown | None |
| CLI                        | No       | Yes           | Yes      | Yes   |
| Runtime dependencies       | 0        | Many          | Minimal  | Minimal |
| Lazy content               | Built-in | Via templates | Via templates | N/A |
| Composition via functions  | Yes      | Limited       | Limited  | No    |
| Tree + flat representation | Yes      | No            | No       | No    |

## When NOT to use ts-plate

ts-plate is a library, not a CLI tool. You won't run `npx ts-plate init my-app`
— that's not what it does. If you want a ready-made scaffolding CLI, you might
be happier with [Plop](https://plopjs.com/) or
[degit](https://github.com/Rich-Harris/degit).

But if you're building a tool that *generates files* — a CLI of your own, a
project initializer, a code generator for your framework — ts-plate is the
engine under the hood. It does one thing (tree → flat outputs → disk) and does
it without getting in your way.

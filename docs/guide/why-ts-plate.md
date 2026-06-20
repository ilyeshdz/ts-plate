# Why ts-plate?

There are plenty of ways to generate files. I have used enough of them to know that most of the friction is not about writing files. It is about expressing intent.

The moment a generator starts hiding logic inside templates, conventions, or framework-specific rules, the code becomes harder to understand than the thing it was supposed to produce.

ts-plate was written to avoid that.

## The template problem

Template languages are fine until they are not.

They ask you to switch mental models: code here, string interpolation there, control flow somewhere else. That split is tolerable for a small snippet, but it becomes tiring once a generator grows into something your team relies on.

You end up debugging formatting, indentation, escaping, and context instead of the actual structure of the output.

With ts-plate, the generator stays in TypeScript. The logic lives where your editor, formatter, tests, and types already understand it.

## The composition problem

Most scaffolding tools are good at producing one project at a time. They are much less good at composition.

ts-plate treats composition as the normal case:

```ts
function component(name: string) {
  return dir(
    name,
    file(`${name}.tsx`, componentTemplate(name)),
    file(`${name}.test.tsx`, testTemplate(name)),
    file(`${name}.css`, ""),
  );
}

const app = root(
  dir(
    "src",
    component("Button"),
    component("Card"),
    component("Modal"),
  ),
);
```

That style is not a special plugin or framework trick. It is just ordinary functions returning ordinary data.

## The evaluation problem

Generation often depends on values you do not know until the last moment:

- timestamps
- environment flags
- user input
- API responses
- generated IDs

If content is locked into a template too early, you lose some of that flexibility.

ts-plate keeps file content lazy until `emit()` runs:

```ts
const node = file("timestamp.txt", () => new Date().toISOString());
```

That matters when you want the generator to remain honest about when work happens.

## Why not a CLI?

This is one of the most important design choices in the project.

ts-plate intentionally does not try to be the whole experience. It is not a one-command project starter and it does not have an opinionated prompt flow or folder wizard baked into it.

That is a feature, not a limitation.

If you are building a CLI, you probably want to control:

- prompts
- validation
- file selection
- dry runs
- previews
- custom business rules

ts-plate gives you the file-tree layer underneath all of that, and lets your CLI stay yours.

## When it is a good fit

ts-plate is a strong fit when you want:

- a fully type-driven way to build generators
- a small library that stays out of the way
- outputs you can inspect before writing
- code that looks like code, not a template dialect
- a foundation for tools like Bitpress, custom CLIs, or internal scaffolding systems

## When it is not

ts-plate is not the best answer for everyone.

If you want a polished turnkey scaffolder with lots of opinionated defaults, you may be happier with tools that already provide that experience.

If, however, your goal is to build a generator that feels like real software instead of a pile of string templates, ts-plate is a much better starting point.

## A quick comparison

|                            | ts-plate | Yeoman / Plop    | scaffdog      | Degit   |
| -------------------------- | -------- | ---------------- | ------------- | ------- |
| Template language          | None     | EJS / Handlebars | Markdown      | None    |
| CLI                        | No       | Yes              | Yes           | Yes     |
| Runtime dependencies       | 0        | Many             | Minimal       | Minimal |
| Lazy content               | Built-in | Via templates    | Via templates | N/A     |
| Composition via functions  | Yes      | Limited          | Limited       | No      |
| Tree + flat representation | Yes      | No               | No            | No      |

That table is not here to suggest every other tool is wrong. It is here to make the tradeoff obvious. ts-plate exists for people who want the generator layer to feel like regular TypeScript.

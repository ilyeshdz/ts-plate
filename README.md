# @ilyeshdz/ts-plate

Build file trees with functions, not templates.

```bash
npm install @ilyeshdz/ts-plate
```

## Documentation

➡️ **[Full documentation →](https://github.com/ilyeshdz/ts-plate)** (VitePress docs site)

## Quick example

```ts
import { emit, root, dir, file } from "@ilyeshdz/ts-plate";

const tree = root(
  dir("src", file("index.ts", `console.log("hello")`), dir("utils", file("helpers.ts"))),
);

const outputs = await emit(tree);
// [
//   { type: "dir",  path: "src" },
//   { type: "file", path: "src/index.ts", content: 'console.log("hello")' },
//   { type: "dir",  path: "src/utils" },
//   { type: "file", path: "src/utils/helpers.ts" },
// ]
```

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm docs:dev    # documentation dev server
```

## License

MIT

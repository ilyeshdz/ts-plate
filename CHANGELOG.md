# Changelog

## v0.5.1

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.5.0...v0.5.1)

### 🩹 Fixes

- Normalize children in when() for consistency with dir() and root() ([18d76fc](https://github.com/ilyeshdz/ts-plate/commit/18d76fc))
- Validate copy node names for empty, traversal, and absolute paths ([a4a9243](https://github.com/ilyeshdz/ts-plate/commit/a4a9243))
- Expose strategy and cause on TsPlateError base class ([ea999d4](https://github.com/ilyeshdz/ts-plate/commit/ea999d4))
- Align render() signature with emit() using rest params ([9088f1f](https://github.com/ilyeshdz/ts-plate/commit/9088f1f))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

## v0.5.0

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.4.4...v0.5.0)

### 🚀 Enhancements

- Support async when() conditions ([8ae3c1e](https://github.com/ilyeshdz/ts-plate/commit/8ae3c1e))
- Support Uint8Array binary content ([06c2087](https://github.com/ilyeshdz/ts-plate/commit/06c2087))

### 🩹 Fixes

- Validate directory names in emit ([5552878](https://github.com/ilyeshdz/ts-plate/commit/5552878))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

## v0.4.4

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.4.3...v0.4.4)

### 🚀 Enhancements

- Add readonly modifiers and strategy-content type safety ([755a60a](https://github.com/ilyeshdz/ts-plate/commit/755a60a))
- Implement structured error types ([59fb4c3](https://github.com/ilyeshdz/ts-plate/commit/59fb4c3))

### 💅 Refactors

- Reorganize src into nodes and runtime directories with custom error classes ([5a0a48f](https://github.com/ilyeshdz/ts-plate/commit/5a0a48f))

### 📖 Documentation

- Add comprehensive jsdoc to public api ([732a676](https://github.com/ilyeshdz/ts-plate/commit/732a676))
- Better documentation ([5425367](https://github.com/ilyeshdz/ts-plate/commit/5425367))

### 🏡 Chore

- Use workspace typescript version for vscode ([c3f56bc](https://github.com/ilyeshdz/ts-plate/commit/c3f56bc))

### ✅ Tests

- Reduce test suite from 143 to 12 behavior-focused tests ([9358d14](https://github.com/ilyeshdz/ts-plate/commit/9358d14))

### 🤖 CI

- Deploy docs on release published event instead of tag push ([e65a9c3](https://github.com/ilyeshdz/ts-plate/commit/e65a9c3))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

## v0.4.3

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.4.2...v0.4.3)

### 🤖 CI

- Deploy docs on release ([042ae83](https://github.com/ilyeshdz/ts-plate/commit/042ae83))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

## v0.4.2

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.4.1...v0.4.2)

### 🩹 Fixes

- Release workflow ([2a487d4](https://github.com/ilyeshdz/ts-plate/commit/2a487d4))

### 🤖 CI

- Remove release workflow (changelogen opens browser to create release manually) ([afb29d2](https://github.com/ilyeshdz/ts-plate/commit/afb29d2))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

## v0.4.1

[compare changes](https://github.com/ilyeshdz/ts-plate/compare/v0.4.0...v0.4.1)

### 🚀 Enhancements

- Add file conflict strategies ([646a520](https://github.com/ilyeshdz/ts-plate/commit/646a520))
- Support dynamic filenames ([a43ef47](https://github.com/ilyeshdz/ts-plate/commit/a43ef47))
- Support arrays as children in dir and root ([366bbb9](https://github.com/ilyeshdz/ts-plate/commit/366bbb9))
- Support directory copy with copy-dir ([92199eb](https://github.com/ilyeshdz/ts-plate/commit/92199eb))

### 🩹 Fixes

- Add packages field to pnpm-workspace.yaml ([f659ccb](https://github.com/ilyeshdz/ts-plate/commit/f659ccb))

### 📖 Documentation

- Add VitePress documentation site with GitHub Pages deployment ([7cfc862](https://github.com/ilyeshdz/ts-plate/commit/7cfc862))
- Restructure README to follow standard-readme spec ([4ca3ad1](https://github.com/ilyeshdz/ts-plate/commit/4ca3ad1))
- Refresh docs and homepage copy for ts-plate ([5eb62c6](https://github.com/ilyeshdz/ts-plate/commit/5eb62c6))
- Simplify documentation ([1f10a50](https://github.com/ilyeshdz/ts-plate/commit/1f10a50))

### 🏡 Chore

- Remove Bitpress mentions from documentation ([0f34db2](https://github.com/ilyeshdz/ts-plate/commit/0f34db2))
- Add Husky pre-commit hook to run oxfmt on all files ([3b9dadb](https://github.com/ilyeshdz/ts-plate/commit/3b9dadb))

### 🎨 Styles

- Apply formatting across docs and config files ([3c108c4](https://github.com/ilyeshdz/ts-plate/commit/3c108c4))
- Remove custom background color from body to use VitePress default ([daecb96](https://github.com/ilyeshdz/ts-plate/commit/daecb96))

### 🤖 CI

- Only deploy docs on release ([d24c0c7](https://github.com/ilyeshdz/ts-plate/commit/d24c0c7))

### ❤️ Contributors

- Ilyes Hernandez ([@ilyeshdz](https://github.com/ilyeshdz))

---
layout: home

hero:
  name: ts-plate
  text: Build file trees with TypeScript, not templates.
  tagline: A tiny, zero-dependency library for generator logic that stays readable, testable, and fully in your control.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/ilyeshdz/ts-plate

features:
  - icon: 🧩
    title: Functions first
    details: Compose trees with file(), dir(), root(), when(), and copy() instead of learning another template language.
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

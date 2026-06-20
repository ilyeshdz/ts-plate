import { defineConfig } from "vitepress";

export default defineConfig({
  base: process.env.DOCS_BASE || "/",

  title: "ts-plate",
  description: "A lightweight library for building file trees declaratively.",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "API", link: "/api/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Why ts-plate?", link: "/guide/why-ts-plate" },
            { text: "Core Concepts", link: "/guide/core-concepts" },
            { text: "Recipes", link: "/guide/recipes" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [{ text: "Overview", link: "/api/" }],
        },
      ],
    },
  },
});

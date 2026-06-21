import { defineConfig } from "vitepress";

export default defineConfig({
  base: process.env.DOCS_BASE || "/",

  title: "ts-plate",
  description: "A tiny TypeScript library for composing file trees and generator output.",
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    siteTitle: "ts-plate",
    nav: [
      { text: "Home", link: "/" },
      { text: "Docs", link: "/guide/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Essentials", link: "/guide/essentials" },
            { text: "Recipes", link: "/guide/recipes" },
          ],
        },
      ],
    },
    footer: {
      message: "MIT Licensed.",
      copyright: `${new Date().getFullYear()} Ilyes Hernandez`,
    },
    socialLinks: [{ icon: "github", link: "https://github.com/ilyeshdz/ts-plate" }],
  },
});

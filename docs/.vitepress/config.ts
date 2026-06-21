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
      { text: "Docs", link: "/guide/introduction" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Docs",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Getting Started", link: "/guide/getting-started" },
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

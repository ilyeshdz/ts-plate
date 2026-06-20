import type { Node, Output } from "./types";

export async function emit(...nodes: Node[]): Promise<Output[]> {
  const outputs: Output[] = [];

  function join(base: string, name: string) {
    return base ? `${base}/${name}` : name;
  }

  async function walk(node: Node, basePath: string) {
    switch (node.type) {
      case "root":
        for (const child of node.children) {
          await walk(child, basePath);
        }
        break;

      case "dir": {
        const nextPath = join(basePath, node.name);
        outputs.push({ type: "dir", path: nextPath });

        for (const child of node.children) {
          await walk(child, nextPath);
        }

        break;
      }

      case "copy":
        outputs.push({
          type: "copy",
          path: join(basePath, node.name),
          from: node.from,
        });
        break;

      case "file":
        outputs.push({
          type: "file",
          path: join(basePath, node.name),
          content: typeof node.content === "function" ? await node.content() : node.content,
        });
        break;

      case "conditional": {
        const pass = typeof node.condition === "function" ? node.condition() : node.condition;
        if (pass) {
          for (const child of node.children) {
            await walk(child, basePath);
          }
        }
        break;
      }
    }
  }

  for (const node of nodes) {
    await walk(node, "");
  }

  return outputs;
}

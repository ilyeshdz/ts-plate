import type { Node, Output } from "./types";

export function emit(...nodes: Node[]): Output[] {
  const outputs: Output[] = [];

  function join(base: string, name: string) {
    return base ? `${base}/${name}` : name;
  }

  function walk(node: Node, basePath: string) {
    switch (node.type) {
      case "root":
        for (const child of node.children) {
          walk(child, basePath);
        }
        break;

      case "dir": {
        const nextPath = join(basePath, node.name);
        outputs.push({ type: "dir", path: nextPath });

        for (const child of node.children) {
          walk(child, nextPath);
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
          content: node.content,
        });
        break;
    }
  }

  for (const node of nodes) {
    walk(node, "");
  }

  return outputs;
}

import type { FileName, Node, Output, OutputFile } from "./types";

export async function emit(...nodes: Node[]): Promise<Output[]> {
  const outputs: Output[] = [];

  function join(base: string, name: string) {
    return base ? `${base}/${name}` : name;
  }

  async function resolveFileName(name: FileName): Promise<string> {
    return typeof name === "function" ? await name() : name;
  }

  function validateFileName(name: string): void {
    if (name.trim().length === 0) {
      throw new Error(`Invalid filename: "${name}". Filename must not be empty.`);
    }

    if (name.split("/").includes("..")) {
      throw new Error(
        `Invalid filename: "${name}". Filename must not traverse outside the target directory.`,
      );
    }

    if (name.startsWith("/")) {
      throw new Error(
        `Invalid filename: "${name}". Absolute paths are not allowed. Use a relative path instead.`,
      );
    }
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

      case "file": {
        const resolvedName = await resolveFileName(node.name);
        validateFileName(resolvedName);

        const fileOutput: OutputFile = {
          type: "file",
          path: join(basePath, resolvedName),
          content: typeof node.content === "function" ? await node.content() : node.content,
        };
        if (node.options?.strategy) {
          fileOutput.strategy = node.options.strategy;
        }
        outputs.push(fileOutput);
        break;
      }

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

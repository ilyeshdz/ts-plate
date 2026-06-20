import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { FileContent, Output } from "./types";

function serializeContent(content: FileContent | undefined): string {
  if (content === undefined) {
    return "";
  }
  if (typeof content === "string") {
    return content;
  }
  return JSON.stringify(content, null, 2);
}

export async function write(outputs: Output[], basePath?: string): Promise<void> {
  const root = basePath ? resolve(basePath) : process.cwd();

  for (const output of outputs) {
    const fullPath = resolve(root, output.path);

    if (output.type === "dir") {
      await mkdir(fullPath, { recursive: true });
    } else if (output.type === "copy") {
      await mkdir(dirname(fullPath), { recursive: true });
      await cp(output.from, fullPath);
    } else {
      await mkdir(dirname(fullPath), { recursive: true });
      const content = serializeContent(output.content);
      await writeFile(fullPath, content, "utf-8");
    }
  }
}

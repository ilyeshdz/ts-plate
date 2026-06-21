import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { ConflictError, ValidationError } from "../errors";
import type { FileContent, FileStrategy, Output } from "../types";

function serializeContent(content: FileContent | undefined): string {
  if (content === undefined) {
    return "";
  }
  if (typeof content === "string") {
    return content;
  }
  return JSON.stringify(content, null, 2);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(existing: unknown, generated: unknown): unknown {
  if (isPlainObject(existing) && isPlainObject(generated)) {
    const result: Record<string, unknown> = { ...existing };
    for (const key of Object.keys(generated)) {
      result[key] = deepMerge(result[key], generated[key]);
    }
    return result;
  }
  return generated;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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

      const strategy: FileStrategy = output.strategy ?? "overwrite";
      const exists = await fileExists(fullPath);

      if (strategy === "skip" && exists) {
        continue;
      }

      if (strategy === "error" && exists) {
        throw new ConflictError(`File already exists: ${output.path}`);
      }

      if (strategy === "merge" && exists) {
        const generated = output.content;

        if (!isPlainObject(generated)) {
          throw new ValidationError(
            `Cannot merge "${output.path}": generated content must be a JSON object`,
          );
        }

        const existingRaw = await readFile(fullPath, "utf-8");
        let existing: unknown;
        try {
          existing = JSON.parse(existingRaw);
        } catch {
          throw new ValidationError(
            `Cannot merge "${output.path}": existing file is not valid JSON`,
          );
        }

        if (!isPlainObject(existing)) {
          throw new ValidationError(
            `Cannot merge "${output.path}": existing content must be a JSON object`,
          );
        }

        const merged = deepMerge(existing, generated);
        await writeFile(fullPath, JSON.stringify(merged, null, 2), "utf-8");
        continue;
      }

      const content = serializeContent(output.content);
      await writeFile(fullPath, content, "utf-8");
    }
  }
}

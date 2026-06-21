import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { ConflictError, FileSystemError, ValidationError } from "../errors";
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

/**
 * Write an array of resolved {@link Output} objects to disk.
 *
 * Creates intermediate directories as needed. Handles files according to
 * their conflict `strategy`:
 * - `"overwrite"` (default): Replace existing files.
 * - `"skip"`: Leave existing files untouched.
 * - `"error"`: Throw {@link ConflictError} if the file already exists.
 * - `"merge"`: Deep-merge JSON objects (both existing and generated content
 *   must be plain objects).
 *
 * @param outputs - The flat array of {@link Output} objects to write,
 *                  typically produced by {@link emit}.
 * @param basePath - Optional base directory. All output paths are resolved
 *                   relative to this. Defaults to `process.cwd()`.
 * @returns A promise that resolves when all files and directories have been
 *          written.
 *
 * @example
 * ```ts
 * const outputs = await emit(tree);
 * await write(outputs, "./dist");
 * ```
 */
export async function write(outputs: Output[], basePath?: string): Promise<void> {
  const root = basePath ? resolve(basePath) : process.cwd();

  for (const output of outputs) {
    const fullPath = resolve(root, output.path);

    if (output.type === "dir") {
      try {
        await mkdir(fullPath, { recursive: true });
      } catch (cause) {
        throw new FileSystemError(`Failed to create directory '${output.path}'.`, {
          path: output.path,
          nodeType: "dir",
          cause,
        });
      }
    } else if (output.type === "copy") {
      try {
        await mkdir(dirname(fullPath), { recursive: true });
      } catch (cause) {
        throw new FileSystemError(`Failed to create parent directory for '${output.path}'.`, {
          path: output.path,
          nodeType: "copy",
          cause,
        });
      }
      try {
        await cp(output.from, fullPath);
      } catch (cause) {
        throw new FileSystemError(
          `Failed to copy '${output.from}' -> '${output.path}': source file may not exist or is inaccessible.`,
          { path: output.path, nodeType: "copy", cause },
        );
      }
    } else {
      try {
        await mkdir(dirname(fullPath), { recursive: true });
      } catch (cause) {
        throw new FileSystemError(`Failed to create parent directory for '${output.path}'.`, {
          path: output.path,
          nodeType: "file",
          cause,
        });
      }

      const strategy: FileStrategy = output.strategy ?? "overwrite";
      const exists = await fileExists(fullPath);

      if (strategy === "skip" && exists) {
        continue;
      }

      if (strategy === "error" && exists) {
        throw new ConflictError(
          `Cannot write '${output.path}': file already exists and strategy is 'error'. Use strategy 'overwrite' to replace, or 'skip' to leave the existing file unchanged.`,
          { path: output.path, strategy: "error" },
        );
      }

      if (strategy === "merge" && exists) {
        const generated = output.content;

        if (!isPlainObject(generated)) {
          throw new ValidationError(
            `Cannot merge '${output.path}': generated content must be a plain JSON object. Got ${typeof generated === "object" ? "an array" : typeof generated}.`,
            {
              path: output.path,
              nodeType: "file",
              hint: "When using strategy 'merge', the generated content must be a plain object (Record<string, any>), not a string or array.",
            },
          );
        }

        let existingRaw: string;
        try {
          existingRaw = await readFile(fullPath, "utf-8");
        } catch (cause) {
          throw new FileSystemError(`Failed to read existing file '${output.path}' for merge.`, {
            path: output.path,
            nodeType: "file",
            cause,
          });
        }

        let existing: unknown;
        try {
          existing = JSON.parse(existingRaw);
        } catch {
          throw new ValidationError(
            `Cannot merge '${output.path}': existing file contains invalid JSON.`,
            {
              path: output.path,
              nodeType: "file",
              hint: "The merge strategy requires the existing file to be valid JSON. Use 'overwrite' or manually fix the file.",
            },
          );
        }

        if (!isPlainObject(existing)) {
          throw new ValidationError(
            `Cannot merge '${output.path}': existing content must be a JSON object. Got ${Array.isArray(existing) ? "a JSON array" : typeof existing}.`,
            {
              path: output.path,
              nodeType: "file",
              hint: "The merge strategy deep-merges plain objects. The existing file must contain a JSON object (not an array, string, or primitive).",
            },
          );
        }

        const merged = deepMerge(existing, generated);
        try {
          await writeFile(fullPath, JSON.stringify(merged, null, 2), "utf-8");
        } catch (cause) {
          throw new FileSystemError(`Failed to write merged content to '${output.path}'.`, {
            path: output.path,
            nodeType: "file",
            cause,
          });
        }
        continue;
      }

      const content = serializeContent(output.content);
      try {
        await writeFile(fullPath, content, "utf-8");
      } catch (cause) {
        throw new FileSystemError(`Failed to write file '${output.path}'.`, {
          path: output.path,
          nodeType: "file",
          cause,
        });
      }
    }
  }
}

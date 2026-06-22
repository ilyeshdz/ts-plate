import { readdir } from "node:fs/promises";
import { FileSystemError, ValidationError } from "../errors";
import type { CopyDirOptions, FileName, Node, Output, OutputFile } from "../types";

/**
 * Evaluate one or more file trees and produce a flat array of resolved
 * {@link Output} objects.
 *
 * This is where all lazy evaluation happens:
 * - {@link ConditionalNode} conditions are evaluated (sync or async); children of
 *   false conditions are excluded.
 * - Dynamic filenames (functions) are called and resolved.
 * - Dynamic content (functions) are called and resolved.
 * - Filenames are validated (no empty names, no directory traversal, no absolute
 *   paths).
 * - Source directory contents are enumerated for {@link CopyDirNode `copy-dir`}
 *   nodes.
 *
 * `emit()` does **not** write anything to disk. The returned `Output` array can
 * be inspected (e.g., for dry-run previews), transformed, or passed directly to
 * {@link write}.
 *
 * @param nodes - One or more nodes to evaluate. Typically a {@link RootNode}
 *                created by {@link root}, but individual nodes work too.
 * @returns A promise of a flat array of {@link Output} objects, ordered by
 *          tree-walk (depth-first, parents before children).
 *
 * @example
 * ```ts
 * const outputs = await emit(
 *   root(
 *     file("README.md", "# Project"),
 *     dir("src", file("index.ts")),
 *   ),
 * );
 * // outputs: [
 * //   { type: "file", path: "README.md", content: "# Project" },
 * //   { type: "dir", path: "src" },
 * //   { type: "file", path: "src/index.ts" },
 * // ]
 * ```
 */
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
      throw new ValidationError(
        `Filename validation failed: "${name}". Filename must be a non-empty string. Got an empty or whitespace-only value.`,
        {
          path: name,
          nodeType: "file",
          hint: "Provide a non-empty relative filename (e.g., 'index.ts').",
        },
      );
    }

    if (name.split("/").includes("..")) {
      throw new ValidationError(
        `Filename validation failed: "${name}". Path traverses outside the target directory. Directory traversal ('..') is not allowed in filenames.`,
        {
          path: name,
          nodeType: "file",
          hint: "Use a relative path that stays within the target directory.",
        },
      );
    }

    if (name.startsWith("/")) {
      throw new ValidationError(
        `Filename validation failed: "${name}". Absolute paths are not permitted. Use a relative filename instead (e.g., 'src/index.ts').`,
        {
          path: name,
          nodeType: "file",
          hint: "Remove the leading '/' and use a relative path instead.",
        },
      );
    }
  }

  async function walkCopyDir(
    source: string,
    targetBase: string,
    options: CopyDirOptions | undefined,
  ): Promise<void> {
    let entries;
    try {
      entries = await readdir(source, { withFileTypes: true });
    } catch (cause) {
      throw new FileSystemError(`Failed to read source directory '${source}' for copy-dir.`, {
        path: source,
        nodeType: "copy-dir",
        cause,
      });
    }

    for (const entry of entries) {
      const fullPath = `${source}/${entry.name}`;

      if (options?.filter && !options.filter(fullPath)) {
        continue;
      }

      const destName = options?.rename ? options.rename(entry.name) : entry.name;
      const destPath = join(targetBase, destName);

      if (entry.isDirectory()) {
        outputs.push({ type: "dir", path: destPath });
        await walkCopyDir(fullPath, destPath, options);
      } else if (entry.isFile()) {
        outputs.push({ type: "copy", path: destPath, from: fullPath });
      }
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

      case "copy-dir":
        await walkCopyDir(node.from, basePath, node.options);
        break;

      case "file": {
        const resolvedName = await resolveFileName(node.name);
        validateFileName(resolvedName);

        const fileOutput: OutputFile = {
          type: "file",
          path: join(basePath, resolvedName),
          content: typeof node.content === "function" ? await node.content() : node.content,
          ...(node.options?.strategy ? { strategy: node.options.strategy } : {}),
        };
        outputs.push(fileOutput);
        break;
      }

      case "conditional": {
        const pass = typeof node.condition === "function" ? await node.condition() : node.condition;
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

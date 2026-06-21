import type { CopyDirNode, CopyDirOptions, CopyNode, Node } from "../types";

/**
 * Copy a single file from the source filesystem into the output tree.
 *
 * The copy operation executes during `write()`, not during `emit()`.
 * `emit()` only records the copy intent; the actual file copy happens
 * when writing to disk.
 *
 * @param from - Source filesystem path to copy from.
 * @param name - Destination filename in the output tree.
 * @returns A `CopyNode` representing the file copy.
 *
 * @example
 * ```ts
 * copy("/templates/app.ts", "src/app.ts")
 * ```
 */
export function copy(from: string, name: string): CopyNode;

/**
 * Copy an entire directory from the source filesystem into the output tree.
 *
 * Recursively copies all entries. Supports optional `rename` and `filter`
 * transforms. The copy executes during `write()`.
 *
 * @param from - Source directory path on the filesystem.
 * @param options - Options including `rename` (transform entry names)
 *                  and `filter` (exclude paths).
 * @returns A `CopyDirNode` representing the directory copy.
 *
 * @example
 * ```ts
 * // Copy a directory with rename and filter
 * copy("/templates", {
 *   rename: (n) => n.replace(".hbs", ""),
 *   filter: (p) => !p.includes("node_modules"),
 * })
 * ```
 */
export function copy(from: string, options?: CopyDirOptions): CopyDirNode;

export function copy(from: string, nameOrOptions?: string | CopyDirOptions): Node {
  if (typeof nameOrOptions === "string") {
    return { type: "copy", from, name: nameOrOptions };
  }

  return { type: "copy-dir", from, options: nameOrOptions };
}

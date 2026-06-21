import type { DirectoryNode, Node } from "../types";
import { normalizeChildren } from "./normalize-children";

/**
 * Create a directory node in the output tree.
 *
 * A directory node is evaluated at **build time** — it simply stores the
 * name and children as plain data. The directory is not created on disk
 * until `write()` is called.
 *
 * Arrays passed as children are automatically flattened, so you can
 * compose directory contents from helper functions that return `Node[]`.
 *
 * @param name - The directory name (must be a relative path segment,
 *               e.g. `"src"` or `"lib/utils"`).
 * @param children - One or more nodes or arrays of nodes. Arrays are
 *                   recursively flattened.
 * @returns A `DirectoryNode` containing the name and normalized children.
 *
 * @example
 * ```ts
 * dir("src", file("index.ts"), file("utils.ts"))
 * ```
 */
export function dir(name: string, ...children: (Node | Node[])[]): DirectoryNode {
  return {
    type: "dir",
    name,
    children: normalizeChildren(children),
  };
}

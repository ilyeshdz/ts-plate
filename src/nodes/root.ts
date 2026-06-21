import type { Node, RootNode } from "../types";
import { normalizeChildren } from "./normalize-children";

/**
 * Create a root node that groups multiple top-level nodes.
 *
 * A root node is evaluated at **build time** — it simply stores children
 * as plain data. No I/O or content resolution happens until `emit()` is called.
 *
 * Arrays passed as children are automatically flattened, so you can
 * compose trees from functions that return `Node[]`.
 *
 * @param children - One or more nodes or arrays of nodes. Arrays are
 *                   recursively flattened.
 * @returns A `RootNode` containing the normalized children.
 *
 * @example
 * ```ts
 * const tree = root(
 *   dir("src", file("index.ts")),
 *   file("README.md", "# My Project"),
 * );
 * ```
 */
export function root(...children: (Node | Node[])[]): RootNode {
  return {
    type: "root",
    children: normalizeChildren(children),
  };
}

import type { ConditionalNode, Condition, Node } from "../types";
import { normalizeChildren } from "./normalize-children";

/**
 * Create a conditional node that includes children only when a condition is met.
 *
 * The condition is evaluated during **`emit()`** — not at build time.
 * If the condition is a function, it is called lazily when the tree is
 * walked, allowing conditions based on runtime state.
 *
 * Arrays passed as children are automatically flattened, so you can
 * compose conditional contents from helper functions that return `Node[]`.
 *
 * @param condition - A boolean value, a sync function `() => boolean`,
 *                    or an async function `() => Promise<boolean>`.
 * @param children - One or more nodes or arrays of nodes. Arrays are
 *                   recursively flattened.
 * @returns A `ConditionalNode`.
 *
 * @example
 * ```ts
 * // Static condition
 * when(shouldIncludeDebug, file("debug.log"))
 *
 * // Dynamic condition (evaluated at emit time)
 * when(() => process.env.CI === "true", file("ci-config.yml"))
 *
 * // Async condition (resolved during emit)
 * when(async () => {
 *   const user = await fetchCurrentUser();
 *   return user.role === "admin";
 * }, file("admin-panel.ts"))
 * ```
 */
export function when(condition: Condition, ...children: (Node | Node[])[]): ConditionalNode {
  return {
    type: "conditional",
    condition,
    children: normalizeChildren(children),
  };
}

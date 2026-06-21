import type { ConditionalNode, Condition, Node } from "../types";

/**
 * Create a conditional node that includes children only when a condition is met.
 *
 * The condition is evaluated during **`emit()`** — not at build time.
 * If the condition is a function, it is called lazily when the tree is
 * walked, allowing conditions based on runtime state.
 *
 * @param condition - A boolean value or a sync function `() => boolean`.
 *                    Asynchronous conditions are not supported.
 * @param children - One or more nodes to include when the condition is truthy.
 * @returns A `ConditionalNode`.
 *
 * @example
 * ```ts
 * // Static condition
 * when(shouldIncludeDebug, file("debug.log"))
 *
 * // Dynamic condition (evaluated at emit time)
 * when(() => process.env.CI === "true", file("ci-config.yml"))
 * ```
 */
export function when(condition: Condition, ...children: Node[]): ConditionalNode {
  return {
    type: "conditional",
    condition,
    children,
  };
}

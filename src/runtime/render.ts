import type { Node, Output } from "../types";
import { emit } from "./emit";
import { write } from "./write";

/**
 * Evaluate one or more file trees and write the outputs to disk in a single call.
 *
 * Equivalent to `await write(await emit(...nodes), basePath)`.
 * Returns the resolved outputs for inspection (e.g., for logging or
 * dry-run comparison).
 *
 * @param nodes - One or more nodes to evaluate and write.
 * @param basePath - Optional base directory for writing. All output paths
 *                   are resolved relative to this. Defaults to `process.cwd()`.
 * @returns A promise of the resolved {@link Output} array that was written.
 *
 * @example
 * ```ts
 * const outputs = await render(
 *   [root(file("hello.txt", "world"))],
 *   "./dist",
 * );
 * // outputs: [{ type: "file", path: "hello.txt", content: "world" }]
 * ```
 */
export async function render(nodes: Node[], basePath?: string): Promise<Output[]> {
  const outputs = await emit(...nodes);
  await write(outputs, basePath);
  return outputs;
}

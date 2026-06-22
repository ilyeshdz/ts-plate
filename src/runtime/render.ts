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
 * @param basePath - Optional base directory for writing. All output paths
 *                   are resolved relative to this. Defaults to `process.cwd()`.
 * @param nodes - One or more nodes to evaluate and write.
 * @returns A promise of the resolved {@link Output} array that was written.
 *
 * @example
 * ```ts
 * const outputs = await render(
 *   "./dist",
 *   root(file("hello.txt", "world")),
 * );
 * // outputs: [{ type: "file", path: "hello.txt", content: "world" }]
 * ```
 */
export async function render(basePath?: string, ...nodes: Node[]): Promise<Output[]> {
  const outputs = await emit(...nodes);
  await write(outputs, basePath);
  return outputs;
}

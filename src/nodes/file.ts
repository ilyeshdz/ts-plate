import type {
  FileContent,
  FileContentFn,
  FileName,
  FileNode,
  FileOptions,
  FileStrategy,
} from "../types";

/**
 * Create a file node in the output tree.
 *
 * The node is created at **build time** — no I/O or content resolution
 * occurs. If `content` or `name` is a function, it is evaluated lazily
 * during `emit()`.
 *
 * @param name - Static filename, sync resolver `() => string`, or async
 *               resolver `() => Promise<string>`. Resolved during `emit()`.
 * @param content - Static content (`string` written as-is, `Uint8Array` for
 *                  binary, `Record` serialized to JSON), or a sync/async
 *                  resolver. Evaluated during `emit()`.
 * @param options - File behavior options including the conflict `strategy`.
 * @returns A `FileNode` ready to be composed into a tree.
 *
 * @example
 * ```ts
 * // Static string content
 * file("readme.md", "# Hello")
 *
 * // JSON content (serialized with JSON.stringify)
 * file("package.json", { name: "my-project" })
 *
 * // Binary content (written as raw bytes)
 * file("icon.png", new Uint8Array([137, 80, 78, 71]))
 *
 * // Dynamic content (evaluated at emit time)
 * file("data.json", () => fetchConfig())
 *
 * // Dynamic filename (evaluated at emit time)
 * file(() => `${name}.ts`, "export const x = 1")
 *
 * // With conflict strategy
 * file("config.json", { key: "value" }, { strategy: "merge" })
 * ```
 */
export function file(
  name: FileName,
  content: string,
  options?: FileOptions & { strategy?: Exclude<FileStrategy, "merge"> },
): FileNode;

/**
 * Create a file node with JSON-serializable content.
 *
 * @param name - Static filename or dynamic resolver.
 * @param content - A plain object to serialize as JSON.
 * @param options - File behavior options.
 */
export function file(
  name: FileName,
  content: Record<string, unknown>,
  options?: FileOptions,
): FileNode;

/**
 * Create a file node with binary content.
 *
 * @param name - Static filename or dynamic resolver.
 * @param content - A `Uint8Array` to write as raw bytes.
 * @param options - File behavior options.
 */
export function file(
  name: FileName,
  content: Uint8Array,
  options?: FileOptions & { strategy?: Exclude<FileStrategy, "merge"> },
): FileNode;

/**
 * Create a file node with lazy-evaluated content.
 *
 * @param name - Static filename or dynamic resolver.
 * @param content - A sync or async function that returns content at emit time.
 * @param options - File behavior options.
 */
export function file(name: FileName, content?: FileContentFn, options?: FileOptions): FileNode;

export function file(
  name: FileName,
  content?: FileContent | FileContentFn,
  options?: FileOptions,
): FileNode {
  return {
    type: "file",
    name,
    content,
    options,
  };
}

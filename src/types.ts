/**
 * Union of all node types that can appear in a file tree.
 *
 * A `Node` is a plain object — no classes, no methods. Trees are composed
 * at build time using factory functions (`root()`, `dir()`, `file()`, etc.)
 * and evaluated lazily at emit time.
 */
export type Node = RootNode | FileNode | DirectoryNode | CopyNode | CopyDirNode | ConditionalNode;

/**
 * A condition that controls whether a {@link ConditionalNode} is included
 * in the output.
 *
 * - A static `boolean` is evaluated immediately when `emit()` walks the tree.
 * - A `() => boolean | Promise<boolean>` function is called lazily during `emit()`.
 *   Return a `Promise` to resolve the condition asynchronously.
 */
export type Condition = boolean | (() => boolean | Promise<boolean>);

/**
 * Static content for a file node.
 *
 * - `string` — written as-is.
 * - `Record<string, any>` — serialized to pretty-printed JSON.
 * - `Uint8Array` — written as raw bytes (binary files).
 */
export type FileContent = string | Record<string, any> | Uint8Array;

/**
 * Lazy content resolver for a file node.
 *
 * Called during `emit()` to produce the final content. Can be synchronous
 * or asynchronous. Useful for deferring API calls, timestamps, or user input.
 */
export type FileContentFn = () => FileContent | Promise<FileContent>;

/**
 * A filename for a file node.
 *
 * - `string` — static filename used as-is.
 * - `() => string` — dynamic filename resolved at emit time.
 * - `() => Promise<string>` — async dynamic filename resolved at emit time.
 */
export type FileName = string | (() => string) | (() => Promise<string>);

/**
 * Conflict resolution strategy when a file already exists on disk during `write()`.
 *
 * - `"overwrite"` — Replace the existing file (default).
 * - `"skip"` — Leave the existing file untouched.
 * - `"error"` — Throw a {@link ConflictError}.
 * - `"merge"` — Deep-merge JSON objects (both existing and generated must be plain objects).
 */
export type FileStrategy = "overwrite" | "skip" | "error" | "merge";

/**
 * Options for configuring a file node's behavior.
 */
export interface FileOptions {
  /** Conflict resolution strategy when the file already exists. Defaults to `"overwrite"`. */
  readonly strategy?: FileStrategy;
}

/**
 * A file node in the file tree.
 *
 * Created via {@link file()}. Represents a single file with optional content.
 * Content and name may be lazy functions that are resolved during `emit()`.
 */
export interface FileNode {
  readonly type: "file";
  /** The filename — static string or a sync/async resolver function. */
  readonly name: FileName;
  /** Optional content — static value or a sync/async resolver function. */
  readonly content?: FileContent | FileContentFn;
  /** Optional file behavior options. */
  readonly options?: FileOptions;
}

/**
 * A directory node in the file tree.
 *
 * Created via {@link dir()}. Represents a directory that contains child nodes.
 * Directories are created on disk during `write()`.
 */
export interface DirectoryNode {
  readonly type: "dir";
  /** The directory name (must be a relative path segment). */
  readonly name: string;
  /** Child nodes inside this directory. */
  readonly children: readonly Node[];
}

/**
 * A root node that groups multiple top-level nodes.
 *
 * Created via {@link root()}. Useful for composing multiple subtrees
 * or passing several nodes to `emit()` as a single tree.
 */
export interface RootNode {
  readonly type: "root";
  /** Top-level child nodes. */
  readonly children: readonly Node[];
}

/**
 * A single-file copy node.
 *
 * Created via {@link copy()}`(from, name)`. Copies a file from the source
 * filesystem into the output during `write()`.
 */
export interface CopyNode {
  readonly type: "copy";
  /** Source path on the filesystem to copy from. */
  readonly from: string;
  /** Destination filename in the output tree. */
  readonly name: string;
}

/**
 * A directory copy node.
 *
 * Created via {@link copy()}`(from, options?)`. Recursively copies an
 * entire directory from the source filesystem during `write()`, with
 * optional `rename` and `filter` transforms.
 */
export interface CopyDirNode {
  readonly type: "copy-dir";
  /** Source directory path on the filesystem. */
  readonly from: string;
  /** Optional transforms for the copy operation. */
  readonly options?: CopyDirOptions;
}

/**
 * Options for directory copy operations.
 */
export interface CopyDirOptions {
  /** Transform each entry name during copy (e.g., rename extensions). */
  readonly rename?: (name: string) => string;
  /** Filter function — return `false` to exclude a path from the copy. */
  readonly filter?: (path: string) => boolean;
}

/**
 * A conditional node that includes children only when a condition is met.
 *
 * Created via {@link when()}. The condition is evaluated during `emit()`,
 * not at build time. Supports sync and async (Promise-based) conditions.
 */
export interface ConditionalNode {
  readonly type: "conditional";
  /** Boolean or sync/async function evaluated during `emit()`. */
  readonly condition: Condition;
  /** Nodes to include when the condition is truthy. */
  readonly children: readonly Node[];
}

/**
 * Union of all output types produced by {@link emit()}.
 *
 * Outputs are plain, flat objects — unlike the tree structure of `Node`,
 * they represent resolved paths and content ready for `write()`.
 */
export type Output = OutputFile | OutputDirectory | OutputCopy;

/**
 * A resolved file output, ready to be written to disk.
 */
export interface OutputFile {
  readonly type: "file";
  /** Resolved relative path from the output root. */
  readonly path: string;
  /** Resolved file content (lazy functions have been called). */
  readonly content?: FileContent;
  /** Conflict strategy for `write()` — inherited from the source `FileNode`. */
  readonly strategy?: FileStrategy;
}

/**
 * A resolved directory output, ready to be created on disk.
 */
export interface OutputDirectory {
  readonly type: "dir";
  /** Resolved relative path from the output root. */
  readonly path: string;
}

/**
 * A resolved copy output, ready to be copied to disk.
 */
export interface OutputCopy {
  readonly type: "copy";
  /** Resolved relative destination path. */
  readonly path: string;
  /** Source filesystem path to copy from. */
  readonly from: string;
}

import type { CopyDirNode, CopyDirOptions, CopyNode, Node } from "./types";

export function copy(from: string, name: string): CopyNode;
export function copy(from: string, options?: CopyDirOptions): CopyDirNode;
export function copy(from: string, nameOrOptions?: string | CopyDirOptions): Node {
  if (typeof nameOrOptions === "string") {
    return { type: "copy", from, name: nameOrOptions };
  }

  return { type: "copy-dir", from, options: nameOrOptions };
}

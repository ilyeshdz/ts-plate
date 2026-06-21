import type { FileContent, FileContentFn, FileNode, FileOptions } from "./types";

export function file(
  name: string,
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

import type { FileContent, FileContentFn, FileName, FileNode, FileOptions } from "./types";

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

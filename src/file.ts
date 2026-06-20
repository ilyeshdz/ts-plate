import type { FileContent, FileContentFn, FileNode } from "./types";

export function file(name: string, content?: FileContent | FileContentFn): FileNode {
  return {
    type: "file",
    name,
    content,
  };
}

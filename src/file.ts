import type { FileContent, FileNode } from "./types";

export function file(name: string, content?: FileContent): FileNode {
  return {
    type: "file",
    name,
    content,
  };
}

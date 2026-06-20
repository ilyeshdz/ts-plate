import type { DirectoryNode, Node } from "./types";

export function dir(name: string, ...children: Node[]): DirectoryNode {
  return {
    type: "dir",
    name,
    children,
  };
}

import type { DirectoryNode, Node } from "./types";
import { normalizeChildren } from "./normalize-children";

export function dir(name: string, ...children: (Node | Node[])[]): DirectoryNode {
  return {
    type: "dir",
    name,
    children: normalizeChildren(children),
  };
}

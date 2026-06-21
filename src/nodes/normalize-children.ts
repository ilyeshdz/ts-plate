import type { Node } from "../types";

export function normalizeChildren(children: (Node | Node[])[]): Node[] {
  const result: Node[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...normalizeChildren(child));
    } else {
      result.push(child);
    }
  }

  return result;
}

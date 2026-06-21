import type { Node, RootNode } from "../types";
import { normalizeChildren } from "./normalize-children";

export function root(...children: (Node | Node[])[]): RootNode {
  return {
    type: "root",
    children: normalizeChildren(children),
  };
}

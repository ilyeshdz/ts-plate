import type { ConditionalNode, Condition, Node } from "../types";

export function when(condition: Condition, ...children: Node[]): ConditionalNode {
  return {
    type: "conditional",
    condition,
    children,
  };
}

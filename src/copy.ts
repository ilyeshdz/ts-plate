import type { CopyNode } from "./types";

export function copy(from: string, name: string): CopyNode {
  return { type: "copy", from, name };
}

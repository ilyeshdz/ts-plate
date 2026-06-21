import type { Node, Output } from "../types";
import { emit } from "./emit";
import { write } from "./write";

export async function render(nodes: Node[], basePath?: string): Promise<Output[]> {
  const outputs = await emit(...nodes);
  await write(outputs, basePath);
  return outputs;
}
